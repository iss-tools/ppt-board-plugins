import { ref, onMounted } from 'vue';

export interface RemarkUser {
  userId: string;
  name: string;
  avatar: string; // e.g. "/avatar/avatar_42.svg"
}

const STORAGE_KEY = 'ppt_board_remark_user';

const adjectives = [
  'Happy', 'Lucky', 'Sunny', 'Cool', 'Brave', 'Smart', 'Quick', 'Fast', 'Super', 'Magic',
  'Wild', 'Fierce', 'Gentle', 'Bold', 'Calm', 'Bright', 'Swift', 'Mighty', 'Eager', 'Witty',
  'Silent', 'Clever', 'Sharp', 'Noble', 'Proud', 'Busy', 'Keen', 'Epic', 'Chill', 'Zesty',
  'Jolly', 'Grand', 'Shiny', 'Sleek', 'Fresh', 'Crisp', 'Lively', 'Funky', 'Crazy', 'Dapper',
  'Feisty', 'Quirky', 'Snappy', 'Plump', 'Nimble', 'Merry', 'Cozy', 'Daring', 'Neon', 'Breezy'
];
const nouns = [
  'Cat', 'Dog', 'Fox', 'Bear', 'Lion', 'Tiger', 'Wolf', 'Eagle', 'Shark', 'Panda',
  'Owl', 'Hawk', 'Falcon', 'Raven', 'Deer', 'Moose', 'Elk', 'Rhino', 'Hippo', 'Zebra',
  'Camel', 'Llama', 'Alpaca', 'Sheep', 'Goat', 'Frog', 'Toad', 'Snake', 'Lizard', 'Gecko',
  'Turtle', 'Whale', 'Dolphin', 'Seal', 'Walrus', 'Otter', 'Beaver', 'Badger', 'Sloth', 'Koala',
  'Kangaroo', 'Wombat', 'Possum', 'Raccoon', 'Skunk', 'Mouse', 'Rat', 'Hamster', 'Gerbil', 'Swan'
];

export function generateRandomName(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective} ${randomNoun}`;
}

function generateRandomUser(): RemarkUser {
  const randomId = Math.floor(Math.random() * 50) + 1;

  return {
    userId: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: generateRandomName(),
    avatar: `/avatar/scenery_${randomId}.jpg`,
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

  const updateUser = (updates: Partial<RemarkUser>) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser.value));
    }
  };

  return {
    currentUser,
    initUser,
    updateUser,
    generateRandomName,
  };
}
