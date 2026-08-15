"use client";

const toolIcons = [
  "ps.svg",
  "id.svg",
  "lr.svg",
  "达芬奇.svg",
  "剪映.svg",
  "pr.svg",
  "GPT.svg",
  "Gemini.svg",
  "grok.svg",
];

export function ToolsIconGallery() {
  return (
    <div className="tools-icon-gallery" aria-label="工具图标循环展示">
      <div className="tools-icon-gallery-track" aria-hidden="true">
        {toolIcons.map((icon, index) => (
          <span className="tools-icon-gallery-item" style={{ "--tool-index": index } as React.CSSProperties} key={icon}>
            <img src={`/assets/profile/tools/${icon}`} alt="" />
          </span>
        ))}
      </div>
    </div>
  );
}
