import { ref, onMounted } from 'vue';

export interface RemarkUser {
  userId: string;
  name: string;
  avatar: string; // e.g. "/avatar/avatar_42.svg"
}

const STORAGE_KEY = 'ppt_board_remark_user';

const adjectives = ['Happy', 'Lucky', 'Sunny', 'Cool', 'Brave', 'Smart', 'Quick', 'Fast', 'Super', 'Magic'];
const nouns = ['Cat', 'Dog', 'Fox', 'Bear', 'Lion', 'Tiger', 'Wolf', 'Eagle', 'Shark', 'Panda'];

function generateRandomUser(): RemarkUser {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomId = Math.floor(Math.random() * 50) + 1;

  return {
    userId: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: `${randomAdjective} ${randomNoun}`,
    avatar: `/avatar/avatar_${randomId}.svg`,
  };
}

// Global state so it's shared across the plugin
const currentUser = ref<RemarkUser | null>(null);

export function useRemarkUser() {
  const initUser = () => {
    if (currentUser.value) return currentUser.value;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        currentUser.value = JSON.parse(stored) as RemarkUser;
        return currentUser.value;
      }
    } catch (e) {
      console.warn('Failed to parse stored remark user:', e);
    }

    // Generate new if none exists
    const newUser = generateRandomUser();
    currentUser.value = newUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  };

  return {
    currentUser,
    initUser,
  };
}
