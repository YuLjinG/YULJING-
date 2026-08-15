"use client";

import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FoldText } from "./components/fold-text";
import { SiteFooter, SiteHeader } from "./components/site-chrome";
import { ToolsIconGallery } from "./components/tools-icon-gallery";

const tickerCopy = Array.from(
  { length: 28 },
  () => "渔凉景·YuLjinG ｜ 广告位招租",
).join("　　");

const personalTags = [
  "21岁正是闯的年纪",
  "3年视觉转化经验",
  "技多不压身",
  "拥抱AI & 学习AI",
  "我的资料 +",
];

const profileSections = [
  { id: "about", title: "关于我", english: "About Me" },
  { id: "competencies", title: "核心能力", english: "Core Competencies" },
  { id: "working-style", title: "工作方式", english: "Working Style" },
  { id: "tools", title: "工具与技术", english: "Tools & Technologies" },
  { id: "experience", title: "经历概览", english: "Experience\nOverview" },
  { id: "interests", title: "兴趣与审美", english: "Interests\n&\nAesthetics" },
  { id: "contact", title: "联系方式", english: "Contact" },
] as const;

const designQuotes = [
  { text: "Good design makes a product useful.", author: "Dieter Rams" },
  { text: "Design is a plan for arranging elements to accomplish a particular purpose.", author: "Charles Eames" },
  { text: "If you do it right, it will last forever.", author: "Massimo Vignelli" },
  { text: "Good design is as little design as possible.", author: "Dieter Rams" },
  { text: "To design is to communicate clearly by whatever means you can control or master.", author: "Milton Glaser" },
];

type NamePosition = { x: number; y: number };

function ProfileContentMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const scrollRoot = root?.closest<HTMLElement>(".profile-drawer-scroll");
    if (!root || !scrollRoot || typeof IntersectionObserver === "undefined") return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const textTargets = Array.from(root.querySelectorAll<HTMLElement>("p, li")).filter((element) => element.textContent?.trim());
    const visualTargets = Array.from(root.querySelectorAll<HTMLElement>(".profile-about-media, .profile-competency-map, .profile-drawer-bottom-close, .profile-facts, .profile-tools-list div, .tools-icon-gallery, .profile-contact-content dl div"));
    const timers = new Map<HTMLElement, ReturnType<typeof window.setInterval>>();

    const stopText = (element: HTMLElement) => {
      const timer = timers.get(element);
      if (timer) window.clearInterval(timer);
      timers.delete(element);
    };

    const showText = (element: HTMLElement) => {
      stopText(element);
      const source = element.dataset.profileText ?? element.textContent?.trim() ?? "";
      element.dataset.profileText = source;
      if (reduceMotion) {
        element.textContent = source;
        gsap.set(element, { opacity: 1 });
        return;
      }

      let frame = 0;
      gsap.set(element, { opacity: 1 });
      const timer = window.setInterval(() => {
        const revealedCount = Math.floor((frame / 18) * source.length);
        element.textContent = Array.from(source, (character, index) => {
          if (/\s/.test(character)) return character;
          if (index < revealedCount) return character;
          return scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
        }).join("");
        frame += 1;
        if (frame > 18) {
          stopText(element);
          element.textContent = source;
        }
      }, 30);
      timers.set(element, timer);
    };

    const hideText = (element: HTMLElement) => {
      stopText(element);
      if (reduceMotion) return;
      gsap.to(element, { opacity: 0, duration: 0.16, ease: "power1.in" });
    };

    gsap.set(textTargets, { opacity: reduceMotion ? 1 : 0 });
    gsap.set(visualTargets, { opacity: reduceMotion ? 1 : 0 });

    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? showText(entry.target as HTMLElement) : hideText(entry.target as HTMLElement));
    }, { root: scrollRoot, threshold: 0.28 });
    const visualObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => gsap.to(entry.target, { opacity: entry.isIntersecting ? 1 : 0, duration: reduceMotion ? 0 : 0.32, ease: "power1.out" }));
    }, { root: scrollRoot, threshold: 0.2 });

    textTargets.forEach((element) => textObserver.observe(element));
    visualTargets.forEach((element) => visualObserver.observe(element));
    return () => {
      textObserver.disconnect();
      visualObserver.disconnect();
      textTargets.forEach(stopText);
      gsap.killTweensOf([...textTargets, ...visualTargets]);
    };
  }, []);

  return <div className="profile-content-motion" ref={rootRef}>{children}</div>;
}

function ProfileSectionContent({ sectionId, onClose }: { sectionId: typeof profileSections[number]["id"]; onClose: () => void }) {
  if (sectionId === "about") {
    return (
      <div className="profile-about-content">
        <div className="profile-about-media">
          <img className="profile-about-portrait" src="/assets/profile/profile-portrait.jpg" alt="余景辉个人照片" />
          <img className="profile-about-bridge" src="/assets/profile/huizhou-bridge.jpg" alt="惠州大桥夜景" />
        </div>
        <dl className="profile-facts">
          <div><dt>余景辉</dt><dd>广东惠州</dd></div>
          <div><dt>YuLjinG（RiverYu）</dt><dd /></div>
          <div><dt>21岁</dt><dd>视觉转化方向</dd></div>
        </dl>
        <p>具备电商视觉、品牌内容与 AI 内容生产经验，擅长将产品卖点和用户需求转化为清晰、有吸引力的页面、图文与短视频内容。参与过商品详情页、店铺视觉、活动素材及内容优化，通过视觉表达提升产品信息传达与用户信任。可拓展商品内容运营、品牌内容运营、独立站内容运营及产品营销等方向。</p>
      </div>
    );
  }

  if (sectionId === "competencies") {
    return (
      <div className="profile-competency-map">
        <img
          src="/assets/profile/core-competencies.svg"
          alt="核心能力关键词：商品主图、详情页、活动页与店铺视觉设计；产品卖点提炼、用户需求与使用场景拆解；商品图文、短视频脚本、分镜与内容提案；品牌视觉、内容调性与素材一致性把控；AI 辅助图像、脚本、分镜和内容素材生产；产品拍摄素材整理与视觉优化"
        />
      </div>
    );
  }

  if (sectionId === "working-style") {
    return (
      <div className="profile-copy-block">
        <p>我习惯先理解产品、用户和实际目标，再决定该怎么表达。</p>
        <p>做内容时，我会同时考虑画面、文案和信息结构：用户第一眼看到什么、最需要被说服的点是什么、哪些内容能建立信任。AI 对我来说是提高探索和生产效率的工具，但判断产品、内容方向和品牌感，仍然需要人来完成。</p>
        <p>我喜欢目标明确、分工清楚、能得到真实反馈的工作环境，也愿意在测试和复盘中持续优化。</p>
        <ul>
          <li>从产品、受众和卖点出发，而非只做“好看”</li>
          <li>视觉、文案、内容结构一体化思考</li>
          <li>用 AI 加快素材探索、提案与迭代</li>
          <li>重视品牌一致性与实际表达效果</li>
        </ul>
      </div>
    );
  }

  if (sectionId === "tools") {
    return (
      <div className="profile-tools-content">
        <dl className="profile-tools-list">
          <div><dt>设计：</dt><dd>Ps, Ai, Id, Lr</dd><i>…</i></div>
          <div><dt>内容：</dt><dd>达芬奇, 剪映, Pr</dd><i>…</i></div>
          <div><dt>AI：</dt><dd>GPT, Codex, Gemini, Claude</dd><i>…</i></div>
        </dl>
        <ToolsIconGallery />
      </div>
    );
  }

  if (sectionId === "experience") {
    return (
      <ul className="profile-long-list">
        <li>我有电商视觉、商品内容和品牌视觉相关经验，参与过商品主图、详情页、活动素材、产品拍摄、店铺基础视觉和内容输出等工作。</li>
        <li>也有 TikTok 商品内容的实操经历，参与过选品辅助、脚本构思、视频制作发布和基础数据观察。这让我更理解内容测试的逻辑，也更明确自己希望在有品牌定位的团队里，把内容测试沉淀成长期的品牌资产。</li>
        <li>目前持续关注跨境电商、独立站、TikTok 内容和 AI 内容生产，希望把视觉、内容和转化意识放进更完整的品牌业务中。</li>
      </ul>
    );
  }

  if (sectionId === "interests") {
    return (
      <ul className="profile-long-list">
        <li>我喜欢克制、清晰、有质感，同时真正服务于产品的信息表达。</li>
        <li>平时会关注品牌如何通过视觉、材质、版式和内容建立辨识度，也会研究不同产品是怎样把复杂卖点变成用户愿意停下来看的内容。</li>
        <li>除了设计，我也关注商业趋势、产品逻辑、电影、摄影和音乐。</li>
        <li>我的审美关键词：清晰、克制、强调产品、有结构、不做无效装饰。</li>
      </ul>
    );
  }

  return (
    <div className="profile-contact-content">
      <dl>
        <div><dt>邮箱：</dt><dd>yuljing0405@163.com</dd></div>
        <div><dt>微信：</dt><dd>yjh18928378397</dd></div>
        <div><dt>电话：</dt><dd>18928378397</dd></div>
        <div><dt>小红书：</dt><dd>渔凉景YuLjinG</dd></div>
        <div><dt>抖音：</dt><dd>渔凉景YuLjinG</dd></div>
      </dl>
      <button type="button" className="profile-drawer-bottom-close" onClick={onClose} aria-label="关闭个人资料"><span aria-hidden="true">‹</span></button>
    </div>
  );
}

function PersonalProfileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div className="profile-drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.aside className="profile-drawer" role="dialog" aria-modal="true" aria-label="个人资料" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }} onMouseDown={(event) => event.stopPropagation()}>
            <div className="profile-drawer-scroll">
              {profileSections.map((section) => (
                  <section className="profile-drawer-section" key={section.id}>
                    <div className="profile-drawer-heading">
                      <FoldText text={section.english} className="profile-drawer-title-en" fontSize="clamp(14px, 3.4cqw, 22px)" triggerOnView />
                      <FoldText text={section.title} className="profile-drawer-title-cn" fontSize="clamp(17px, 4.2cqw, 27px)" fontWeight={700} duration={0.65} stagger={0.045} triggerOnView />
                    </div>
                    <div className="profile-drawer-content">
                      <ProfileContentMotion><ProfileSectionContent sectionId={section.id} onClose={onClose} /></ProfileContentMotion>
                    </div>
                  </section>
              ))}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

const scrambleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

function TextScramble({ children, className, delay = 0 }: { children: string; className?: string; delay?: number }) {
  const [text, setText] = useState("");

  useEffect(() => {
    let frame = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        const revealedCount = Math.floor((frame / 22) * children.length);
        setText(Array.from(children, (character, index) => {
          if (character === " ") return " ";
          if (index < revealedCount) return character;
          return scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
        }).join(""));
        frame += 1;
        if (frame > 22) {
          if (intervalId) window.clearInterval(intervalId);
          setText(children);
        }
      }, 38);
    }, delay);

    return () => {
      window.clearTimeout(startId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [children, delay]);

  return <span className={className} aria-hidden="true">{text}</span>;
}

const ambientLogoPolygons = [
  [[56.31, 1.69], [30.82, 67.51], [0, 0], [29.42, 174.03], [28.24, 102.27]],
  [[66.79, 1.75], [37.5, 103.18], [37.5, 174.03], [80.17, 147.52], [111.84, 1.75], [74.67, 141.86], [43.46, 164.86]],
  [[121.19, 1.75], [88.68, 148.02], [49.18, 174.03], [165.69, 174.03], [107.44, 158.02]],
  [[213.19, 1.75], [209.37, 145.37], [185.1, 174.03], [117.24, 154.28], [165.22, 160.55], [194.86, 139.86]],
  [[201.7, 174.03], [219.2, 151.52], [219.2, 30.5], [232.71, 174.03]],
  [[259.21, 1.75], [264.71, 128.19], [225.2, 30.51], [239.7, 174.03], [241.7, 106.02], [280.19, 174.03]],
  [[319.14, 20.52], [266.04, 1.75], [285.38, 174.03], [348.71, 174.03], [324.89, 116.28], [313.38, 143.29], [341.88, 170.28], [304.88, 156.29], [273.24, 12.55]],
  [[219.2, 28.22], [223.67, 1.75], [218.59, 1.75]],
];

const toPointString = (points: number[][]) => points.map(([x, y]) => `${x} ${y}`).join(" ");

const driftedPoints = (points: number[][], shapeIndex: number) => points.map(([x, y], pointIndex) => {
  const phase = (shapeIndex + 1) * 1.73 + (pointIndex + 1) * 2.17;
  const amount = 3.4 + ((shapeIndex + pointIndex) % 3) * 1.25;
  return [
    Number((x + Math.sin(phase) * amount).toFixed(2)),
    Number((y + Math.cos(phase * 1.19) * amount).toFixed(2)),
  ];
});

function HeroLogo() {
  const activationDelays = [1.07, 2.03, 0.59, 1.55, 0.35, 1.79, 0.83, 1.31];
  const pieceStyle = (index: number) => ({ animationDelay: `${activationDelays[index]}s` });

  return (
    <motion.svg
      className="hero-mark"
      viewBox="0 0 348.71 174.03"
      role="img"
      aria-label="YuLjinG"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      <polygon className="logo-vector-piece" style={pieceStyle(0)} points="56.31 1.69 30.82 67.51 0 0 29.42 174.03 28.24 102.27 56.31 1.69" />
      <polygon className="logo-vector-piece" style={pieceStyle(1)} points="66.79 1.75 37.5 103.18 37.5 174.03 80.17 147.52 111.84 1.75 74.67 141.86 43.46 164.86 66.79 1.75" />
      <polygon className="logo-vector-piece" style={pieceStyle(2)} points="121.19 1.75 88.68 148.02 49.18 174.03 165.69 174.03 107.44 158.02 121.19 1.75" />
      <polygon className="logo-vector-piece" style={pieceStyle(3)} points="213.19 1.75 209.37 145.37 185.1 174.03 117.24 154.28 165.22 160.55 194.86 139.86 213.19 1.75" />
      <polygon className="logo-vector-piece" style={pieceStyle(4)} points="201.7 174.03 219.2 151.52 219.2 30.5 232.71 174.03 201.7 174.03" />
      <path className="logo-vector-piece" style={pieceStyle(5)} d="m259.21,1.75l5.5,126.44-39.51-97.68,14.5,143.52,2-68.01,38.49,68.01L259.21,1.75Z" />
      <polygon className="logo-vector-piece" style={pieceStyle(6)} points="319.14 20.52 266.04 1.75 285.38 174.03 348.71 174.03 324.89 116.28 313.38 143.29 341.88 170.28 304.88 156.29 273.24 12.55 319.14 20.52" />
      <polygon className="logo-vector-piece" style={pieceStyle(7)} points="219.2 28.22 223.67 1.75 218.59 1.75 219.2 28.22" />
    </motion.svg>
  );
}

function AmbientLogoMist() {
  return (
    <div className="ambient-logo-mist" aria-hidden="true">
      <svg viewBox="0 0 348.71 174.03" preserveAspectRatio="xMidYMid meet">
        <g>
          {ambientLogoPolygons.map((polygon, shapeIndex) => {
            const original = toPointString(polygon);
            const drifted = toPointString(driftedPoints(polygon, shapeIndex));
            const duration = 2.6 + shapeIndex * 0.32;

            return (
              <polygon key={shapeIndex} points={original} fill="currentColor">
                <animate
                  attributeName="points"
                  values={`${original};${drifted};${original}`}
                  keyTimes="0;0.5;1"
                  dur={`${duration}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
                />
              </polygon>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function OutlineLogoMist() {
  const [isHovered, setIsHovered] = useState(false);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  return (
    <div className={`outline-logo-mist ${isHovered ? "is-hovered" : ""}`} aria-hidden="true">
      <svg
        viewBox="0 0 348.71 174.03"
        preserveAspectRatio="xMidYMid meet"
        pointerEvents="auto"
        style={{ transform: `translate(-50%,-50%) rotate(-5deg) translate(${pointerOffset.x}px, ${pointerOffset.y}px)` }}
        onPointerEnter={() => setIsHovered(true)}
        onPointerMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setPointerOffset({
            x: ((event.clientX - (bounds.left + bounds.width / 2)) / bounds.width) * 48,
            y: ((event.clientY - (bounds.top + bounds.height / 2)) / bounds.height) * 34,
          });
        }}
        onPointerLeave={() => {
          setIsHovered(false);
          setPointerOffset({ x: 0, y: 0 });
        }}
      >
        <g>
          {ambientLogoPolygons.map((polygon, shapeIndex) => {
            const original = toPointString(polygon);
            const drifted = toPointString(driftedPoints(polygon, shapeIndex + 4));
            const duration = 7.5 + shapeIndex * 0.7;

            return (
              <polygon key={shapeIndex} points={original} fill="none" stroke="currentColor" strokeWidth="0.58" strokeLinecap="round" strokeLinejoin="round">
                <animate
                  attributeName="points"
                  values={`${original};${drifted};${original}`}
                  keyTimes="0;0.5;1"
                  dur={`${duration}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
                />
              </polygon>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const tagRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastScrollYRef = useRef(0);
  const [activeTag, setActiveTag] = useState(0);
  const [activeQuote, setActiveQuote] = useState(0);
  const [namePosition, setNamePosition] = useState<NamePosition>({ x: 0, y: 0 });
  const [profileOpen, setProfileOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setProfileOpen(searchParams.get("profile") === "1");
  }, [searchParams]);

  const closeProfile = () => {
    setProfileOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("profile");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const updateNamePosition = () => {
    const section = sectionRef.current;
    const activeElement = tagRefs.current[activeTag];
    if (!section || !activeElement) return;

    const sectionBox = section.getBoundingClientRect();
    const activeBox = activeElement.getBoundingClientRect();
    const nextY = activeBox.top - sectionBox.top + activeBox.height * 0.08;
    setNamePosition((current) => Math.abs(current.y - nextY) < 0.5 ? current : { x: 0, y: nextY });
  };

  useLayoutEffect(() => {
    updateNamePosition();
    window.addEventListener("resize", updateNamePosition);
    return () => window.removeEventListener("resize", updateNamePosition);
  }, [activeTag]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      const nextScrollY = window.scrollY;
      lastScrollYRef.current = nextScrollY;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateNamePosition();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeTag]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveQuote((current) => (current + 1) % designQuotes.length);
    }, 8000);
    return () => window.clearInterval(intervalId);
  }, [activeQuote]);

  const switchQuote = (direction: -1 | 1) => {
    setActiveQuote((current) => (current + direction + designQuotes.length) % designQuotes.length);
  };

  const quote = designQuotes[activeQuote];

  return (
    <section className="about-section" id="about" ref={sectionRef}>
      <OutlineLogoMist />
      <div className="about-tag-list" aria-label="个人标签">
        {personalTags.map((tag, index) => (
          <button
            className={`personal-tag ${activeTag === index ? "is-active" : ""}`}
            key={tag}
            onFocus={() => setActiveTag(index)}
            onMouseEnter={() => setActiveTag(index)}
            onClick={() => {
              if (index === personalTags.length - 1) setProfileOpen(true);
            }}
            aria-expanded={index === personalTags.length - 1 ? profileOpen : undefined}
            ref={(element) => { tagRefs.current[index] = element; }}
            type="button"
          >
            {tag}
          </button>
        ))}
      </div>

      <motion.div
        className="identity-name"
        animate={namePosition}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div className="identity-name-copy" key={activeTag === personalTags.length - 1 ? "more" : "identity"} initial={{ opacity: 0, filter: "blur(8px)", y: 7 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} exit={{ opacity: 0, filter: "blur(8px)", y: -7 }} transition={{ duration: 0.24, ease: "easeInOut" }}>
            {activeTag === personalTags.length - 1 ? (
              <>
                <span>点击查看</span>
                <small>（更多信息）</small>
              </>
            ) : (
              <>
                <span>（余景辉）</span>
                <small>渔凉景 · YuLjinG</small>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="portrait-row">
        <img src="/assets/portrait.jpg" alt="渔凉景个人照片" />
        <div className="portrait-quote" aria-live="polite">
          <div className="quote-controls">
            <button type="button" onClick={() => switchQuote(-1)} aria-label="上一条设计名言">←</button>
            <span>&lt;{activeQuote + 1}/{designQuotes.length}&gt;</span>
            <button type="button" onClick={() => switchQuote(1)} aria-label="下一条设计名言">→</button>
          </div>
          <div className="quote-progress" aria-hidden="true"><motion.span key={activeQuote} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 8, ease: "linear" }} /></div>
          <AnimatePresence mode="wait">
            <motion.div className="quote-copy" key={activeQuote} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <p>{quote.text.split(" ").map((word, index) => <motion.span className={index < quote.text.split(" ").length - 1 ? "quote-word quote-word-gap" : "quote-word"} key={`${word}-${index}`} initial={{ opacity: 0, filter: "blur(8px)", y: 5 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.32, delay: index * 0.045 }}>{word}</motion.span>)}</p>
              <motion.small initial={{ opacity: 0, filter: "blur(7px)", y: 7 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.34, delay: 0.24 }}>——{quote.author}</motion.small>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <PersonalProfileDrawer isOpen={profileOpen} onClose={closeProfile} />
    </section>
  );
}

type FeatureCardProps = {
  href: string;
  label: string;
  previewSrc: string;
  previewAlt: string;
  isSectionVisible: boolean;
};

const featureTextVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.01 } },
  exit: { opacity: 1, transition: { staggerChildren: 0.01, staggerDirection: 1 } },
};

const featureTextCharacterVariants = {
  hidden: { opacity: 0, filter: "blur(10px) brightness(0%)", y: 0 },
  visible: { opacity: 1, filter: "blur(0px) brightness(100%)", y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, filter: "blur(10px) brightness(0%)", y: -30, transition: { duration: 0.4 } },
};

function FeatureTextEffect({ text, isVisible, className }: { text: string; isVisible: boolean; className: string }) {
  return (
    <motion.span className={className} aria-label={text} variants={featureTextVariants} initial="hidden" animate={isVisible ? "visible" : "exit"}>
      {Array.from(text).map((character, index) => <motion.span key={`${character}-${index}`} aria-hidden="true" variants={featureTextCharacterVariants}>{character}</motion.span>)}
    </motion.span>
  );
}

function FeatureCard({ href, label, previewSrc, previewAlt, isSectionVisible }: FeatureCardProps) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLSpanElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const lastPointerPositionRef = useRef<{ x: number; y: number } | null>(null);

  const updatePreviewPosition = (event: PointerEvent<HTMLAnchorElement>) => {
    const position = { x: event.clientX, y: event.clientY };
    lastPointerPositionRef.current = position;
    if (!isPreviewVisible) {
      setPreviewPosition(position);
      setIsPreviewVisible(true);
      return;
    }
    const preview = previewRef.current;
    if (preview) {
      preview.style.left = `${position.x}px`;
      preview.style.top = `${position.y}px`;
    }
  };

  useEffect(() => {
    const syncPreviewWithPointer = () => {
      const position = lastPointerPositionRef.current;
      const link = linkRef.current;
      if (!position || !link) {
        setIsPreviewVisible(false);
        return;
      }
      const elementUnderPointer = document.elementFromPoint(position.x, position.y);
      const isPointerOverLink = Boolean(elementUnderPointer && link.contains(elementUnderPointer));
      setPreviewPosition(position);
      setIsPreviewVisible(isPointerOverLink);
    };
    window.addEventListener("scroll", syncPreviewWithPointer, { passive: true });
    return () => window.removeEventListener("scroll", syncPreviewWithPointer);
  }, []);

  return (
    <>
      <Link ref={linkRef} href={href} className={`feature-card${isPreviewVisible ? " is-preview-visible" : ""}`} onPointerEnter={updatePreviewPosition} onPointerMove={updatePreviewPosition} onPointerLeave={() => { lastPointerPositionRef.current = null; setIsPreviewVisible(false); }}>
        <FeatureTextEffect className="feature-card-label" text={label} isVisible={isSectionVisible} />
        <FeatureTextEffect className="feature-arrow" text="→" isVisible={isSectionVisible} />
      </Link>
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isPreviewVisible && (
            <span ref={previewRef} className="feature-preview-cursor" style={{ left: previewPosition.x, top: previewPosition.y }}>
              <motion.img src={previewSrc} alt={previewAlt} initial={{ height: 0, opacity: 0, scale: 0.3 }} animate={{ height: "auto", opacity: 1, scale: 1 }} exit={{ height: 0, opacity: 0, scale: 0.3 }} transition={{ type: "spring", duration: 0.3, bounce: 0.1 }} />
            </span>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function FeatureEntrances() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsSectionVisible(entry.isIntersecting), { threshold: 0.72 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="feature-slabs" aria-label="作品入口" ref={sectionRef}>
      <FeatureCard href="/graphic" label="（平面板块）" previewSrc="/assets/entry-graphic-preview.jpg" previewAlt="平面板块画板预览" isSectionVisible={isSectionVisible} />
      <FeatureCard href="/photo" label="（摄影板块）" previewSrc="/assets/entry-photo-preview.png" previewAlt="摄影板块画板预览" isSectionVisible={isSectionVisible} />
    </section>
  );
}

export default function Home() {
  const handleHeroAdvance = () => {
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 76;
    window.scrollTo({
      top: Math.max(0, window.innerHeight - headerHeight),
      behavior: "smooth",
    });
  };

  return (
    <main className="dark-page" id="top">
      <SiteHeader active="home" />
      <div className="home-intro">
        <div className="ticker" aria-label="渔凉景·YuLjinG ｜ 广告位招租">
          <div className="ticker-track">
            <span>{tickerCopy}</span>
            <span aria-hidden="true">{tickerCopy}</span>
          </div>
        </div>

        <section className="home-hero">
          <AmbientLogoMist />
          <h1 aria-label="Exploring visual possibilities. Crafting distinctive brand experiences.">
            <TextScramble className="hero-scramble-line" delay={200}>Exploring visual possibilities.</TextScramble>
            <TextScramble className="hero-scramble-line" delay={440}>Crafting distinctive brand experiences.</TextScramble>
          </h1>
          <motion.p className="smile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>: )</motion.p>
          <HeroLogo />
          <motion.div className="hero-divider" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}><span /><button type="button" onClick={handleHeroAdvance} aria-label="进入下一部分">↑</button><span /></motion.div>
        </section>
      </div>

      <div className="home-content-surface">
        <AboutSection />

        <FeatureEntrances />

        <SiteFooter />
      </div>
    </main>
  );
}
