export type BrandStorySection = {
  id: string;
  index: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  body: string[];
  highlights: string[];
  image: {
    src: string;
    alt: string;
  };
  /** Swap to image-left / text-right on desktop. */
  reverse?: boolean;
};

export const brandStorySections: BrandStorySection[] = [
  {
    id: "origin",
    index: "01",
    navLabel: "緣起",
    eyebrow: "The Beginning",
    title: "從一顆水晶開始的相遇",
    body: [
      "Crystal 的起點，來自一段需要被安放的日子。那時我們開始接觸天然水晶，發現它不像任何速效的解方，卻能在安靜配戴的日常裡，慢慢把心穩住。",
      "我們相信，每個人都值得擁有一個屬於自己的錨點——不是用來依賴，而是提醒自己，任何時候都可以重新回到平靜。於是 Crystal 誕生，希望把這份安定感，交到更多人手上。"
    ],
    highlights: ["源自真實的自我安頓經驗", "從一條手鍊開始的分享", "陪伴超過 10,000 位顧客找到自己的頻率"],
    image: {
      src: "https://goodaytarot.com/images/about-crystal.jpg",
      alt: "Crystal 品牌起源"
    }
  },
  {
    id: "belief",
    index: "02",
    navLabel: "理念",
    eyebrow: "The Belief",
    title: "每一顆水晶，都在等一個對的人",
    body: [
      "Crystal 相信，每一顆水晶都帶著自己的頻率。它不修復你，它提醒你，你本來就是完整的。",
      "水晶不是魔法，但它是一個錨點，讓你在忙碌、混亂、或疲憊的日子裡，想起自己值得被好好對待。我們不談誇張的能量效果，只想陪你把日子過得更靠近自己一點。"
    ],
    highlights: ["100% 天然晶石，不做誇大功效承諾", "從你的狀態出發，而非制式配方", "陪伴日常，而非追求速效"],
    image: {
      src: "https://goodaytarot.com/images/workshop-products.jpg",
      alt: "Crystal 品牌理念"
    },
    reverse: true
  },
  {
    id: "craft",
    index: "03",
    navLabel: "堅持",
    eyebrow: "The Craft",
    title: "天然、手作，剛剛好的份量",
    body: [
      "每一顆珠子，都由我們親手挑選紋理與色澤，寧可花更久的時間，也不將就一顆不對的石頭。手鍊採獨門壓實綁法製作，兼顧牢固與線條的細緻感。",
      "我們刻意維持小批量製作，不追求快速量產，只希望每一件作品，都經得起你長久的陪伴與凝視。"
    ],
    highlights: ["每顆珠子皆為人工挑選，拒絕批量瑕疵", "獨門手鍊壓實綁法，兼顧牢固與細節", "小批量製作，堅持慢工出細活"],
    image: {
      src: "https://goodaytarot.com/images/workshop-small-class.jpg",
      alt: "Crystal 工藝堅持"
    }
  }
];
