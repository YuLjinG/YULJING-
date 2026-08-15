"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PhotoMasonry } from "./photo-masonry";
import { SiteFooter, SiteHeader } from "./site-chrome";
import TextType from "./text-type";

const brandImages = ["内容1.jpg", "内容2.jpg", "内容3.jpg", "内容4.jpg"];
const posterImages = ["6.jpg", "5.jpg", "1.jpg", "4.jpg", "2.jpg", "3.jpg"];
const keyVisualImages = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"];
const detailOneImages = ["detail-1-1.png", "detail-1-2.png"];
const detailTwoImages = ["detail-2-1.png", "detail-2-2.png"];
const productPhotoImages = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"];
const otherPhotoImages = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"];
const posterDetails = {
  "1.jpg": {
    title: "Re:Carbon 碳变计划",
    concept: "该海报围绕低碳生活倡导主题展开设计，希望通过视觉语言传递环保行动的理念。我将扳手作为核心元素，利用工具“改变、修复”的象征意义与碳减排主题结合，表达每个人都可以参与环保改变的概念。同时将文字进行图形化处理，并结合手工感字体与简洁插画风格，让整体画面更具亲和力，减少环保主题的距离感，使信息传递与视觉表现达到平衡。",
  },
  "2.jpg": {
    title: "No Drug, New Life 禁毒新生",
    concept: "该海报围绕国际禁毒日主题展开设计，希望通过强烈的视觉对比传递远离毒品、珍惜生命的宣传理念。我将注射器作为主要视觉符号，并通过红色斜线切割画面，形成警示感和视觉冲击力，同时结合植物元素表达生命与希望的概念。整体采用高饱和色彩和复古印刷质感，加强海报的传播性，让严肃的禁毒主题以更直观、更年轻化的方式被观众理解和关注。",
  },
  "3.jpg": {
    title: "一碗面的人生滋味",
    concept: "该海报是为面店新品推广设计的门店展示海报，目标是在有限的展示空间内快速吸引顾客注意，并突出新品面的特色。我以产品本身作为视觉中心，通过放大食物主体、搭配手写风格字体和温暖色调，营造出具有烟火气和亲切感的餐饮氛围。同时结合品牌卖点信息进行层级整理，让顾客能够快速获取新品信息。整体设计强化了产品吸引力，使海报既具备宣传功能，也保留了面食文化中的温暖与人情感。",
  },
  "4.jpg": {
    title: "用电安全·防患未燃",
    concept: "该海报围绕实验室用电安全宣传展开设计，目的是用更直观的方式提醒使用者重视日常操作规范，减少安全隐患。我把“插线板冒烟”和“触电警示”作为核心画面，用夸张的漫画式表现强化危险感，同时结合黄黑警示色和大字标题，提升远距离下的识别度。版面中加入“四禁止”和安全用电提示，让信息更清晰好读，整体既有视觉冲击力，也兼顾了实验室安全宣传的实用性。",
  },
  "5.jpg": {
    title: "元气早餐计划",
    concept: "该海报是为早餐店新品活动设计的宣传物料，主要用于门店展示和社交媒体传播，需要在短时间内吸引顾客关注并突出早餐优惠信息。我以“元气、活力”的早餐场景为设计方向，通过高饱和暖色调、醒目的大字号排版和早餐元素插画，营造轻松积极的视觉氛围。同时将价格、活动信息和营业信息进行层级划分，让顾客能够快速获取核心内容。整体设计强化了早餐的亲切感与促销吸引力，使海报兼具门店传播效果和社交平台的视觉表现力。",
  },
  "6.jpg": {
    title: "JAZZ IN YOUR AREA 爵士招新计划",
    concept: "该海报是为学校舞蹈队招新活动设计的宣传海报，需求是在突出街舞氛围的同时，将队伍成员完整呈现出来，增强团队吸引力。我以街头文化为视觉方向，通过高对比度黑白人物拼贴、粗体英文标题和涂鸦元素打造年轻、有活力的视觉效果。同时对多位成员照片进行层次化排版，让人物既保持独立识别度，又形成统一的团队形象。整体设计强化了舞蹈队自由、个性和年轻化的特点，使海报兼具招新信息传递和视觉感染力。",
  },
} as const;
const keyVisualDetails = {
  "1.jpg": {
    title: "户外引火工具头图视觉设计",
    concept: "该主图是为户外引火工具设计的电商首图，目标是在第一视觉中突出产品特点，并快速传递便携、易用的使用体验。我采用产品实拍图作为核心视觉，通过火焰点燃的瞬间强化产品功能和使用场景，同时利用简洁的文字排版将产品名称与核心卖点进行突出展示。整体保持户外场景的真实感，让用户能够直观感受到产品的使用方式和氛围，提升产品识别度与购买吸引力。",
  },
  "2.jpg": {
    title: "WAIYE 户外多功能工具主视觉设计",
    concept: "该主图是为户外多功能工具设计的电商首图，重点是在有限的信息展示中突出产品质感和户外使用属性。由于产品本身功能较多，我没有选择堆叠功能信息，而是通过实拍场景展现工具与自然环境之间的联系。画面以真实户外环境作为背景，利用光影、材质和细节表现强化金属质感，同时搭配简洁的文字信息突出产品定位，让用户能够快速感受到产品的便携性、可靠性以及适用户外场景的特点。",
  },
  "3.jpg": {
    title: "户外棘轮扳手主视觉设计",
    concept: "该主图是为户外棘轮扳手设计的电商头图，重点是让用户第一眼就看清产品结构和使用状态。我采用手持实拍的方式，把产品直接放进真实使用语境里，同时利用虚化背景突出主体，让视线更集中在扳手本身。画面中也保留了螺丝批头和棘轮结构这些关键信息，再配合简洁的卖点文案，既强化了产品的专业感，也让整体视觉更直观、更有使用代入感。",
  },
  "4.jpg": {
    title: "三件套福袋主视觉设计",
    concept: "这张主图是为服装三件套福袋做的电商头图，重点是把套组内容一眼说明白，同时提升产品的真实感和吸引力。我把三件衣服的主要图案都直接放进画面里，避免用户看不清款式差异，再搭配模特上身效果，让整体展示更直观，也更容易建立信任感。下方则集中放置套组名称和“100%棉、男女通款”等核心卖点，方便用户快速抓住重点。模特由我用AI完成生成，服装图案也由我独立设计。",
  },
  "5.jpg": {
    title: "信仰主题文创香片主视觉设计",
    concept: "该主图是为基督教文创香片产品设计的电商展示图，重点是清晰呈现不同款式插画和产品特色。我采用平铺展示的方式，将四款香片按照统一比例排列，让用户能够直观看到整体系列效果，同时保留产品插画本身的细节和文化表达。整体以简洁干净的留白作为视觉基础，搭配品牌色和主题文字，突出文创产品的温暖感与纪念意义，让用户更容易理解产品内容并建立情感连接。",
  },
  "6.jpg": {
    title: "十字架图案主视觉设计",
    concept: "这张主图是为服装单品链接做的电商头图，目标人群比较聚焦在信仰相关受众，所以我没有去分散展示太多内容，而是直接把视觉重点放在胸前的大图案上，突出产品最核心的识别点。画面里加入模特运动中的姿态和衣服自然形成的褶皱，让整体比普通平拍更有活力，也更能体现上身状态。下方再补充产品名称和“100%棉、宽松落肩”等主要卖点，方便用户快速建立印象。模特部分由我使用AI完成生成。",
  },
} as const;
const scaleGroupVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.075 } },
};
const scaleItemVariants = {
  hidden: { opacity: 0, scale: 0.86 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
};
const portfolioContentEntranceVariants = {
  hidden: { opacity: 0, filter: "blur(10px) brightness(0%)", y: 0 },
  visible: { opacity: 1, filter: "blur(0px) brightness(100%)", y: 0, transition: { duration: 0.4 } },
};

function AnimatedScaleGroup({ className, children }: { className: string; children: ReactNode }) {
  return <motion.div className={className} variants={scaleGroupVariants} initial="hidden" animate="visible">{children}</motion.div>;
}

export function PortfolioPage({ type }: { type: "graphic" | "photo" }) {
  const isGraphic = type === "graphic";
  const firstTitle = isGraphic ? "品牌VI设计" : "产品拍摄";
  const following = isGraphic
    ? [["主图&海报设计", "Key Visual & Poster Design"], ["电商详情页设计", "E-commerce Experience Design"]]
    : [["其他拍摄", "Key Visual & Poster Design"]];

  return (
    <main className="portfolio-page">
      <SiteHeader active={type} />
      <DrawerSection className="featured-section" chinese={firstTitle} english="Visual Identity Design">
        {isGraphic ? (
        <div className="brand-content">
          <div className="brand-hero-placeholder">
            <video
              className="brand-hero-video"
              src="/assets/brand-vi/maile-logo-motion.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="麦莱品牌 Logo 动效"
            />
          </div>
          <AnimatedScaleGroup className="brand-gallery">{brandImages.map((image) => <motion.div key={image} variants={scaleItemVariants}><InteractiveArtwork className="brand-artwork" src={`/assets/brand-vi/${image}`} alt="Brand visual identity design" showHoverCursor imageOnlyDetail /></motion.div>)}</AnimatedScaleGroup>
          <div className="brand-text">
            <article><h1>我对“麦莱”的品牌看法</h1><p>我认为，“麦莱”不只是一个面包品牌，更像是一种关于自然、生长与日常生活的表达。</p><p>它从家楼下的普通面包店出发，没有刻意制造距离感，而是希望通过新鲜、朴实且具有温度的产品，重新拉近人与食物、人与生活之间的联系。</p><p>“麦莱”所传递的，不是刻意追求复杂与奢华，而是在真实日常中发现质感，在朴素事物中建立审美。</p></article>
            <article><h1>品牌理念</h1><p>以自然为源，以面包为媒介，连接土地与生活。</p><p>“麦莱”希望像一片重新被开垦的土地，在保留原味朴实感的同时，持续孕育新的可能。每一颗麦子都代表一次生长，每一份面包都承载着对日常生活的认真回应。</p></article>
          </div>
        </div>
        ) : <PhotoProductContent />}
      </DrawerSection>
      {following.map(([chinese, english]) => (
        <DrawerSection className="empty-section" chinese={chinese} english={english} key={chinese}>
          {isGraphic
            ? chinese === "主图&海报设计" ? <GraphicVisualContent /> : <GraphicEcommerceContent />
            : <PhotoOtherContent />}
        </DrawerSection>
      ))}
      <SiteFooter />
    </main>
  );
}

function PhotoProductContent() {
  return <PhotoCarouselContent title="Product Photography" chinese="产品摄影" description="该模块用于展示个人工作期间完成的产品摄影项目。通过对产品形态、材质以及使用环境的观察与捕捉，以摄影语言强化产品视觉表达，记录不同项目中的视觉探索与实践经验。" images={productPhotoImages} assetFolder="products" altPrefix="产品摄影作品" />;
}

function PhotoOtherContent() {
  return <PhotoCarouselContent title="Other Photography" chinese="其他拍摄" description="该模块用于展示个人工作期间完成的其他摄影项目，通过不同主题、场景与视觉观察，记录影像实践中的多样化探索。" images={otherPhotoImages} assetFolder="other" altPrefix="其他拍摄作品" />;
}

function PhotoCarouselContent({ title, chinese, description, images, assetFolder, altPrefix }: { title: string; chinese: string; description: string; images: string[]; assetFolder: "products" | "other"; altPrefix: string }) {
  const photoItems = images.map((image, index) => ({
    image: `/assets/photo/${assetFolder}/${image}`,
    alt: `${altPrefix} ${index + 1}`,
  }));
  const aspectRatios = assetFolder === "products"
    ? [2 / 3, 2 / 3, 2 / 3, 2 / 3, 2 / 3, 2 / 3]
    : [2 / 3, 3 / 2, 3 / 2, 2 / 3, 3 / 2, 2 / 3, 3 / 2];
  const masonryItems = photoItems.map((item, index) => ({ id: item.image, aspectRatio: aspectRatios[index] ?? 2 / 3 }));

  return (
    <div className="photo-product-showcase">
      <motion.header className="photo-product-heading" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
        <h1>{title}</h1>
        <h2>{chinese}</h2>
        </motion.header>
      <div className="photo-product-rule" />
      <div className="photo-product-layout">
        <motion.div className="photo-product-copy" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.45 }}>
          <p>{description}</p>
        </motion.div>
        <motion.div className="photo-product-masonry-shell" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
          <PhotoMasonry
            items={masonryItems}
            renderItem={(item) => {
              const photo = photoItems.find((photoItem) => photoItem.image === item.id)!;
              return <InteractiveArtwork className="photo-masonry-artwork" src={photo.image} alt={photo.alt} imageOnlyDetail />;
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function GraphicVisualContent() {
  return (
    <div className="graphic-work-content graphic-visual-content">
      <h2>海报</h2>
      <AccordionGallery
        items={posterImages.map((image, index) => ({ src: `/assets/graphic/posters/${image}`, label: `海报 ${String(index + 1).padStart(2, "0")}`, detailTitle: posterDetails[image as keyof typeof posterDetails]?.title, detailConcept: posterDetails[image as keyof typeof posterDetails]?.concept }))}
        defaultIndex={0}
        expandRatio={0.4}
        height={560}
        gap={13}
        radius={17}
        duration={0.6}
        parallax={1.05}
        tilt={5}
        imageMode="cover"
        activeAspectRatio={2480 / 3508}
        fullWidth
        scaleWithWidth
      />
      <h2>主图</h2>
      <AccordionGallery items={keyVisualImages.map((image, index) => ({ src: `/assets/graphic/key-visuals/${image}`, label: `主图 ${String(index + 1).padStart(2, "0")}`, detailTitle: keyVisualDetails[image as keyof typeof keyVisualDetails]?.title, detailConcept: keyVisualDetails[image as keyof typeof keyVisualDetails]?.concept }))} defaultIndex={0} height={420} imageMode="cover" activeAspectRatio={1} fullWidth />
    </div>
  );
}

function AccordionGallery({ items, defaultIndex = 2, expandRatio = 0.52, height = 460, gap = 10, radius = 16, duration = 0.6, parallax = 0.5, tilt = 0, imageMode = "contain", activeAspectRatio, fullWidth = false, scaleWithWidth = false }: { items: Array<{ src: string; label: string; detailTitle?: string; detailConcept?: string }>; defaultIndex?: number; expandRatio?: number; height?: number; gap?: number; radius?: number; duration?: number; parallax?: number; tilt?: number; imageMode?: "contain" | "cover"; activeAspectRatio?: number; fullWidth?: boolean; scaleWithWidth?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(Math.min(defaultIndex, items.length - 1));
  const galleryRef = useRef<HTMLDivElement>(null);
  const [activeWidth, setActiveWidth] = useState<number>();
  useEffect(() => {
    if (!activeAspectRatio || !galleryRef.current) return;
    const gallery = galleryRef.current;
    const updateActiveWidth = () => setActiveWidth(gallery.clientHeight * activeAspectRatio);
    updateActiveWidth();
    const observer = new ResizeObserver(updateActiveWidth);
    observer.observe(gallery);
    return () => observer.disconnect();
  }, [activeAspectRatio]);
  const galleryStyle = {
    "--accordion-height": `${height}px`,
    "--accordion-gap": `${gap}px`,
    "--accordion-radius": `${radius}px`,
    "--accordion-expand-ratio": String(expandRatio),
    "--accordion-duration": `${duration}s`,
    "--accordion-tilt": "0deg",
    "--accordion-parallax-x": "0px",
    "--accordion-parallax-y": "0px",
    "--accordion-active-width": activeWidth ? `${activeWidth}px` : `${height * (activeAspectRatio ?? expandRatio)}px`,
  } as CSSProperties;
  const updateMotion = (event: PointerEvent<HTMLDivElement>) => {
    if (!tilt || !galleryRef.current) return;
    const rect = galleryRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    galleryRef.current.style.setProperty("--accordion-tilt-x", `${-y * tilt}deg`);
    galleryRef.current.style.setProperty("--accordion-tilt-y", `${x * tilt}deg`);
    galleryRef.current.style.setProperty("--accordion-parallax-x", `${x * parallax * 10}px`);
    galleryRef.current.style.setProperty("--accordion-parallax-y", `${y * parallax * 10}px`);
  };
  const resetMotion = () => {
    if (!galleryRef.current) return;
    galleryRef.current.style.setProperty("--accordion-tilt-x", "0deg");
    galleryRef.current.style.setProperty("--accordion-tilt-y", "0deg");
    galleryRef.current.style.setProperty("--accordion-parallax-x", "0px");
    galleryRef.current.style.setProperty("--accordion-parallax-y", "0px");
  };

  return (
    <motion.div ref={galleryRef} className={`accordion-gallery accordion-gallery--${imageMode}${activeAspectRatio ? " accordion-gallery--natural-aspect" : ""}${fullWidth ? " accordion-gallery--full-width" : ""}${scaleWithWidth ? " accordion-gallery--scale-with-width" : ""}`} style={galleryStyle} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} onPointerMove={updateMotion} onPointerLeave={resetMotion}>
      {items.map((item, index) => (
        <div className={`accordion-gallery-item${activeIndex === index ? " is-active" : ""}`} key={item.src} onPointerEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)}>
          <InteractiveArtwork className="accordion-gallery-artwork" src={item.src} alt={item.label} detailTitle={item.detailTitle} detailConcept={item.detailConcept} showHoverCursor />
          <span className="accordion-gallery-label" aria-hidden="true">{item.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

function InteractiveArtwork({ className, src, alt, detailSources, previewLoopSources, detailTitle = "", detailConcept = "", hoverCursorLabel = "More", showHoverPlus = true, showHoverCursor = false, imageOnlyDetail = false }: { className: string; src: string; alt: string; detailSources?: string[]; previewLoopSources?: string[]; detailTitle?: string; detailConcept?: string; hoverCursorLabel?: string; showHoverPlus?: boolean; showHoverCursor?: boolean; imageOnlyDetail?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const [isHoverCursorVisible, setIsHoverCursorVisible] = useState(false);
  const [hoverCursorPosition, setHoverCursorPosition] = useState({ x: 0, y: 0 });
  const hoverCursorRef = useRef<HTMLSpanElement>(null);
  const isHoverCursorActiveRef = useRef(false);
  const isScrollableDetail = detailSources !== undefined;
  const isImageOnlyDetail = imageOnlyDetail && !isScrollableDetail;
  const detailImages = detailSources ?? [src];
  const lightboxPanelClass = isScrollableDetail ? "detail-page-lightbox" : `${className}-lightbox${isImageOnlyDetail ? " image-only-lightbox" : ""}`;
  const resetArtworkState = () => { setOffset({ x: 0, y: 0, rotateX: 0, rotateY: 0 }); setIsOpen(false); };

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") resetArtworkState(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [isOpen]);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const image = event.currentTarget.querySelector("img");
    const rect = image?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect();
    const clamp = (value: number) => Math.max(-0.5, Math.min(0.5, value));
    const x = clamp((event.clientX - rect.left) / rect.width - 0.5);
    const y = clamp((event.clientY - rect.top) / rect.height - 0.5);
    setOffset({ x: 0, y: 0, rotateX: y * -8, rotateY: x * 8 });
  };

  const updateHoverCursor = (event: PointerEvent<HTMLButtonElement>) => {
    const position = { x: event.clientX, y: event.clientY };
    if (!isHoverCursorActiveRef.current) {
      isHoverCursorActiveRef.current = true;
      setHoverCursorPosition(position);
      setIsHoverCursorVisible(true);
      return;
    }
    const cursor = hoverCursorRef.current;
    if (cursor) {
      cursor.style.left = `${position.x}px`;
      cursor.style.top = `${position.y}px`;
    }
  };

  const hideHoverCursor = () => {
    isHoverCursorActiveRef.current = false;
    setIsHoverCursorVisible(false);
  };

  const openArtwork = () => {
    isHoverCursorActiveRef.current = false;
    setIsHoverCursorVisible(false);
    setOffset({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
    setIsOpen(true);
  };

  return (
    <>
      <button className={`artwork-trigger ${className}${showHoverCursor ? " artwork-hover-enabled" : ""}`} type="button" onClick={openArtwork} onPointerEnter={showHoverCursor ? updateHoverCursor : undefined} onPointerMove={showHoverCursor ? updateHoverCursor : undefined} onPointerLeave={showHoverCursor ? hideHoverCursor : undefined} aria-label={`Open ${alt}`}>
        {previewLoopSources ? (
          <span className="ecommerce-preview-loop-mask" aria-hidden="true">
            <span className="ecommerce-preview-loop-track">
              {[0, 1].map((cycle) => <span className="ecommerce-preview-loop-set" key={cycle}>{previewLoopSources.map((previewSource) => <img key={`${cycle}-${previewSource}`} src={previewSource} alt="" loading="lazy" decoding="async" />)}</span>)}
            </span>
          </span>
        ) : <img src={src} alt={alt} loading="lazy" decoding="async" />}
      </button>
      {typeof document !== "undefined" && showHoverCursor && !isOpen && createPortal(
        <AnimatePresence>
          {isHoverCursorVisible && (
            <span ref={hoverCursorRef} className="artwork-hover-cursor-anchor" style={{ left: hoverCursorPosition.x, top: hoverCursorPosition.y }}>
              <motion.span className="artwork-hover-cursor" initial={{ width: 16, height: 16, scale: 0.3, opacity: 0 }} animate={{ width: hoverCursorLabel === "完整查看" ? 96 : 84, height: 34, scale: 1, opacity: 1 }} exit={{ width: 16, height: 16, scale: 0.3, opacity: 0 }} transition={{ ease: "easeInOut", duration: 0.15 }}>
                <motion.span className="artwork-hover-cursor-label" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ ease: "easeInOut", duration: 0.15, delay: 0.04 }}>
                  {hoverCursorLabel}{showHoverPlus && <b aria-hidden="true">+</b>}
                </motion.span>
              </motion.span>
            </span>
          )}
        </AnimatePresence>,
        document.body
      )}
      {typeof document !== "undefined" && isOpen && createPortal(
          <div className="poster-lightbox" role="dialog" aria-modal="true" aria-label="Artwork description" onClick={resetArtworkState}>
          <div className={`poster-lightbox-panel ${lightboxPanelClass}`} onClick={(event) => event.stopPropagation()}>
            {isScrollableDetail ? (
              <div className="poster-lightbox-visual poster-lightbox-scrollable" aria-label={`${alt} detail preview`}>
                <div className={`detail-artwork-stack${detailImages.length > 1 ? " detail-artwork-stack-merged" : ""}`}>
                  {detailImages.map((detailSource, index) => <img key={detailSource} src={detailSource} alt={index === 0 ? alt : ""} loading="eager" decoding="async" />)}
                </div>
              </div>
            ) : (
              <div className="poster-lightbox-visual poster-lightbox-tilt" onMouseMove={handleMove} onMouseLeave={() => setOffset({ x: 0, y: 0, rotateX: 0, rotateY: 0 })}>
                <motion.img src={src} alt={alt} animate={offset} transition={{ type: "spring", stiffness: 210, damping: 28, mass: 0.7 }} />
              </div>
            )}
            {!isImageOnlyDetail && <div className="poster-lightbox-copy">
              <section className="detail-info-field">
                <span><TextType text="项目名称" typingSpeed={70} loop={false} showCursor={false} /></span>
                <p className={detailTitle ? "" : "is-placeholder"}><TextType text={detailTitle || "待补充"} typingSpeed={24} initialDelay={150} loop={false} showCursor={false} /></p>
              </section>
              <section className="detail-info-field">
                <span><TextType text="设计理念" typingSpeed={70} initialDelay={480} loop={false} showCursor={false} /></span>
                <p className={detailConcept ? "" : "is-placeholder"}><TextType text={detailConcept || "待补充"} typingSpeed={16} initialDelay={650} loop={false} showCursor={false} /></p>
              </section>
            </div>}
            <button className="poster-lightbox-close" type="button" onClick={resetArtworkState} aria-label="Close artwork">×</button>
          </div>
        </div>, document.body
      )}
    </>
  );
}

function GraphicEcommerceContent() {
  return (
    <div className="graphic-work-content graphic-ecommerce-content">
      <AnimatedScaleGroup className="ecommerce-preview-grid">
        <motion.article className="ecommerce-preview-card" variants={scaleItemVariants}>
          <h2>（详情页1）</h2>
          <InteractiveArtwork className="ecommerce-preview-artwork ecommerce-preview-artwork-product" src={`/assets/graphic/ecommerce/detail-pages/${detailOneImages[0]}`} detailSources={detailOneImages.map((image) => `/assets/graphic/ecommerce/detail-pages/${image}`)} previewLoopSources={detailOneImages.map((image) => `/assets/graphic/ecommerce/detail-pages/${image}`)} detailTitle="多功能迷你手电筒详情页设计" detailConcept="该详情页是为户外品牌产品推广设计的电商详情页面，目标是在展示产品功能的同时，提升用户对产品性能和使用场景的理解。我围绕“轻量、多功能、便携”的产品特点展开设计，通过自主拍摄产品图片结合场景化展示，将手电筒的外观细节、功能特点以及实际使用环境进行完整呈现。在视觉上采用户外自然环境与简洁信息排版结合的方式，让产品从单纯展示转向使用体验表达，增强页面的真实感和购买吸引力。" alt="手电电商详情页设计" hoverCursorLabel="完整查看" showHoverPlus={false} showHoverCursor />
        </motion.article>
        <motion.article className="ecommerce-preview-card" variants={scaleItemVariants}>
          <h2>（详情页2）</h2>
          <InteractiveArtwork className="ecommerce-preview-artwork ecommerce-preview-artwork-apparel" src={`/assets/graphic/ecommerce/detail-pages/${detailTwoImages[0]}`} detailSources={detailTwoImages.map((image) => `/assets/graphic/ecommerce/detail-pages/${image}`)} previewLoopSources={detailTwoImages.map((image) => `/assets/graphic/ecommerce/detail-pages/${image}`)} detailTitle="CROSS文化衫详情页" detailConcept="这个详情页是为服装产品做的完整展示页，重点是把品牌调性、图案设计和穿着氛围一起呈现出来。服装上的图案由我自己完成设计，因此在页面里我不仅展示了面料、版型和尺码信息，也重点突出图案识别度和系列感。模特部分则是我从0到1用AI生成，结合不同穿搭场景去强化服装上身效果，让整个详情页不只是卖点罗列，更像是在传递一种年轻、轻松的品牌视觉体验。" alt="服装电商详情页设计" hoverCursorLabel="完整查看" showHoverPlus={false} showHoverCursor />
        </motion.article>
      </AnimatedScaleGroup>
    </div>
  );
}

function PortfolioContentMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduceMotion(Boolean(mediaQuery?.matches));
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setHasEntered(true);
      observer.disconnect();
    }, { threshold: 0.24 });
    observer.observe(root);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div
      className="portfolio-content-motion"
      ref={rootRef}
      variants={portfolioContentEntranceVariants}
      initial="hidden"
      animate={hasEntered || reduceMotion ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

function DrawerSection({ children, chinese, english, className = "" }: { children: ReactNode; chinese: string; english: string; className?: string }) {

  return (
    <section className={`portfolio-section ${className}`}>
      <div className="section-bar">
        <span aria-hidden="true" /><strong>{chinese}</strong><b>{english}</b>
      </div>
      <div className="portfolio-content-static-surface">
        <PortfolioContentMotion>{children}</PortfolioContentMotion>
      </div>
    </section>
  );
}
