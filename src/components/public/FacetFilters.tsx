"use client";

import { useRef } from "react";
import type { SearchFacetOption } from "@/lib/search/query";

function FacetGroup({
  legend,
  name,
  options,
}: {
  legend: string;
  name: string;
  options: SearchFacetOption[];
}) {
  if (!options.length) return null;
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-semibold uppercase tracking-wide text-ink-800">{legend}</legend>
      <ul className="mt-3 space-y-2">
        {options.map((option) => (
          <li key={`${name}-${option.value}`}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-800">
              <input
                className="mt-0.5"
                type="checkbox"
                name={name}
                value={option.value}
                defaultChecked={option.selected}
              />
              <span>{option.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

export function FacetFilters({
  query,
  years,
  categories,
  journals,
}: {
  query: string;
  years: SearchFacetOption[];
  categories: SearchFacetOption[];
  journals: SearchFacetOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action="/search"
      method="get"
      className="rounded border border-ink-200 bg-white p-4"
      onChange={() => formRef.current?.requestSubmit()}
    >
      {query ? <input type="hidden" name="q" value={query} /> : null}
      <h2 className="font-serif text-lg">FILTER</h2>
      <FacetGroup legend="Year" name="year" options={years} />
      <FacetGroup legend="Category" name="category" options={categories} />
      <FacetGroup legend="JOURNAL" name="journal" options={journals} />
      <button className="mt-6 text-sm underline" type="submit">
        Apply filters
      </button>
    </form>
  );
}
