"use client";

import { Children, useId, useState, type ReactNode } from "react";

interface SectionTabsProps {
  label: string;
  tabs: { id: string; label: string }[];
  children: ReactNode;
}

export function SectionTabs({ label, tabs, children }: SectionTabsProps) {
  const [active, setActive] = useState(0);
  const uid = useId();
  const panels = Children.toArray(children);

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label={label}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${uid}-${tab.id}`}
            aria-selected={active === i}
            aria-controls={`${uid}-panel-${tab.id}`}
            className="home-tab"
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${uid}-panel-${tab.id}`}
          aria-labelledby={`${uid}-${tab.id}`}
          hidden={active !== i}
        >
          {panels[i]}
        </div>
      ))}
    </>
  );
}
