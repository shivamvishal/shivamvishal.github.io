// status: 'done' (✓), 'todo' (✗), 'ongoing' (~). Optional `link` points to proof/evidence.
// `current`/`target` (e.g. 10 of 15 books) show a "10/15 (67%)" stat and set the item's progress.
// `progress` (0-1) overrides that if you want to set partial credit by hand, e.g. 0.5.
export type Status = 'done' | 'todo' | 'ongoing';

export interface ListItem {
  text: string;
  status: Status;
  link?: string;
  progress?: number;
  current?: number;
  target?: number;
}

// Fraction (0-1) of an item that is complete, used for the header tally.
export function itemProgress(item: ListItem): number {
  if (item.status === 'done') return 1;
  if (item.progress !== undefined) return item.progress;
  if (item.current !== undefined && item.target) return Math.min(item.current / item.target, 1);
  return 0;
}

// Placeholder items — replace with your own.
export const items: ListItem[] = [
  { text: 'Live in another country 🇬🇧', status: 'done' },
  { text: 'Launch this blog site 📜', status: 'done', link: '/' },
  { text: 'Hike a Glacier 🇮🇸🥶', status: 'done'},
  { text: 'Go to Octoberfest 🍻', status: 'todo'},
  { text: 'See Mount Fuji 🗻', status: 'todo'},
  { text: 'Write a book 📕', status: 'todo'},
  { text: 'Start a company', status: 'todo'},
  { text: 'Thermal pool in Iceland 🛁', status: 'done'},
  { text: 'See Northern Lights 🌌', status: 'done'},
  { text: 'Take a hot-air balloon ride', status: 'todo'},
  { text: 'Scuba Dive', status: 'todo'},
  { text: 'Fly an airplane ✈️', status: 'todo'},
  { text: 'Go on a safari 🦁', status: 'todo'},
  { text: 'Meet Founder/CEO of a big company [Mike Bloomberg]', status: 'done'},
  { text: 'Visit all of Europe 🇬🇧🇪🇸🇮🇸🇫🇷🇭🇺🇬🇷🇨🇿🇧🇪🇩🇪🇮🇹🇳🇱🇵🇹🇻🇦', status : 'ongoing', current: 13, target: 44},
  { text: 'Publish a Python package', status: 'todo'},
  { text: 'Run a marathon', status: 'todo'},
  { text: 'Meet a Bollywood actor [Farhan Akhtar]', status: 'done'},
  { text: 'See midnight sun in Norway ☀️', status: 'todo'},
  { text: 'Visit Angkor Wat in Cambodia 🛕', status: 'todo'},
  { text: 'Learn ice skating ⛸️' , status: 'todo'},
  { text: 'Learn to swim', status: 'todo'},
  { text: 'Party in Ibiza 🥳', status: 'done'},
  { text: 'Ski in the Alps 🗻', status: 'todo'},
  { text: 'See windmills in Netherlands', status: 'done'},
  { text: 'See Kailasa temple in India', status: 'todo'},
  { text: 'Visit Grand Canyon', status: 'todo'},
  { text: 'Eat Pizza in Italy', status: 'done'},
  { text: 'Eat Waffles in Belgium', status: 'done'},
  { text: 'Build 6 packs ab', status: 'todo'},
  { text: 'Go to a concert (Coldplay, Maroon5)' , status:'done'},
  { text: 'Casino in Las Vegas', status:'todo'},
  { text: 'Go to DisneyLand (Paris)🎠', status:'done'},
  { text: 'See through London Eye 🎡', status:'done'},
  { text: 'Hop on Bernina Express 🚂 in Switzerland', status:'todo'},
  { text: 'Cruise on Seine with Eiffel tower views 🗼✨', status:'done'}
];
