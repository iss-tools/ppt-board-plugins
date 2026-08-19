import { ref } from 'vue';

export interface WebRTCPeer {
  clientId: string;
  pc: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  isOpen: boolean;
}

export function useWebRTC(onDataReceived: (clientId: string, data: any) => void) {
  const peers = ref<Map<string, WebRTCPeer>>(new Map());

  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const getOrCreatePeer = (
    clientId: string, 
    sendOffer: (offer: RTCSessionDescriptionInit) => void,
    sendCandidate: (candidate: RTCIceCandidate) => void
  ): WebRTCPeer => {
    if (peers.value.has(clientId)) {
      return peers.value.get(clientId)!;
    }

    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendCandidate(event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${clientId}:`, pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeer(clientId);
      }
    };

    const peer: WebRTCPeer = { clientId, pc, dataChannel: null, isOpen: false };

    // Handle receiving a data channel (if they are the offerer)
    pc.ondatachannel = (event) => {
      console.log(`[WebRTC] Received DataChannel from ${clientId}`);
      setupDataChannel(peer, event.channel);
    };

    peers.value.set(clientId, peer);
    return peer;
  };

  const setupDataChannel = (peer: WebRTCPeer, channel: RTCDataChannel) => {
    peer.dataChannel = channel;
    
    channel.onopen = () => {
      console.log(`[WebRTC] DataChannel open with ${peer.clientId}`);
      peer.isOpen = true;
    };

    channel.onclose = () => {
      console.log(`[WebRTC] DataChannel closed with ${peer.clientId}`);
      peer.isOpen = false;
    };

    channel.onerror = (error) => {
      console.error(`[WebRTC] DataChannel error with ${peer.clientId}:`, error);
    };

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onDataReceived(peer.clientId, data);
      } catch (e) {
        console.error('[WebRTC] Failed to parse message', e);
      }
    };
  };

  const initiateConnection = async (
    clientId: string,
    sendOffer: (offer: RTCSessionDescriptionInit) => void,
    sendCandidate: (candidate: RTCIceCandidate) => void
  ) => {
    const peer = getOrCreatePeer(clientId, sendOffer, sendCandidate);
    
    // Create data channel (we are the offerer)
    // Use reliable ordered delivery (default) because element state sync MUST not drop or reorder packets
    const dataChannel = peer.pc.createDataChannel('ppt-board-sync');
    setupDataChannel(peer, dataChannel);

    const offer = await peer.pc.createOffer();
    await peer.pc.setLocalDescription(offer);
    sendOffer(offer);
  };

  const handleOffer = async (
    clientId: string,
    offer: RTCSessionDescriptionInit,
    sendAnswer: (answer: RTCSessionDescriptionInit) => void,
    sendCandidate: (candidate: RTCIceCandidate) => void
  ) => {
    const peer = getOrCreatePeer(clientId, sendOffer => {}, sendCandidate);
    await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    sendAnswer(answer);
  };

  const handleAnswer = async (clientId: string, answer: RTCSessionDescriptionInit) => {
    const peer = peers.value.get(clientId);
    if (peer && peer.pc.signalingState !== 'stable') {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleCandidate = async (clientId: string, candidate: RTCIceCandidateInit) => {
    const peer = peers.value.get(clientId);
    if (peer) {
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const removePeer = (clientId: string) => {
    const peer = peers.value.get(clientId);
    if (peer) {
      peer.dataChannel?.close();
      peer.pc.close();
      peers.value.delete(clientId);
    }
  };

  const broadcast = (data: any) => {
    const payload = JSON.stringify(data);
    peers.value.forEach(peer => {
      if (peer.isOpen && peer.dataChannel?.readyState === 'open') {
        peer.dataChannel.send(payload);
      }
    });
  };
  
  const isPeerConnected = (clientId: string) => {
    const peer = peers.value.get(clientId);
    return peer?.isOpen || false;
  };

  const cleanup = () => {
    peers.value.forEach(peer => removePeer(peer.clientId));
  };

  return {
    peers,
    initiateConnection,
    handleOffer,
    handleAnswer,
    handleCandidate,
    removePeer,
    broadcast,
    isPeerConnected,
    cleanup
  };
}
