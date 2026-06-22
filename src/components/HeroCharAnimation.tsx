"use client";

import React, { CSSProperties } from "react";

interface HeroCharAnimationProps {
  lines: string[];
  baseDelay?: number;
  charDelay?: number;
  className?: string;
  lineClassName?: string;
  charClassName?: string;
  as?: React.ElementType;
}

export default function HeroCharAnimation({
  lines,
  baseDelay = 200,
  charDelay = 30,
  className = "",
  lineClassName = "",
  charClassName = "",
  as: Tag = "h1",
}: HeroCharAnimationProps) {
  let total = 0;

  return (
    <Tag className={className}>
      {lines.map((line, li) => (
        <span key={li} className={lineClassName} style={{ display: "block" }}>
          {line.split(" ").map((word, wi, wArr) => (
            <React.Fragment key={wi}>
              <span style={{ whiteSpace: "nowrap", display: "inline-block" }}>
                {word.split("").map((ch, ci) => {
                  const delay = baseDelay + total * charDelay;
                  total++;
                  return (
                    <span
                      key={ci}
                      className={charClassName}
                      style={{ "--cd": `${delay}ms` } as CSSProperties}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
              {wi < wArr.length - 1 && (
                <span style={{ display: "inline-block", width: ".28em" }}></span>
              )}
            </React.Fragment>
          ))}
        </span>
      ))}
    </Tag>
  );
}
