import { useMemo } from "react";

import locationData from "@/assets/location/location_VN.json";

export interface VNLocationSuggestion {
  id: string;
  label: string;
  shortLabel: string;
}

interface VNWardRaw {
  Name?: string;
  FullName?: string;
  Code?: string;
  ProvinceCode?: string;
}

interface VNProvinceRaw {
  Name?: string;
  FullName?: string;
  Code?: string;
  Wards?: VNWardRaw[];
}

const RAW_PROVINCES = locationData as unknown as VNProvinceRaw[];

let cachedFlatList: VNLocationSuggestion[] | null = null;

function buildFlatList(): VNLocationSuggestion[] {
  if (cachedFlatList) return cachedFlatList;

  const list: VNLocationSuggestion[] = [];
  for (const province of RAW_PROVINCES) {
    const provinceName = province.Name?.trim() || province.FullName?.trim();
    if (!provinceName) continue;

    list.push({
      id: `province-${province.Code ?? provinceName}`,
      label: province.FullName?.trim() || provinceName,
      shortLabel: provinceName,
    });

    for (const ward of province.Wards ?? []) {
      const wardName = ward.Name?.trim() || ward.FullName?.trim();
      if (!wardName) continue;

      const fullLabel = `${ward.FullName?.trim() ?? wardName}, ${provinceName}`;
      list.push({
        id: `ward-${ward.Code ?? wardName}-${province.Code ?? provinceName}`,
        label: fullLabel,
        shortLabel: `${wardName}, ${provinceName}`,
      });
    }
  }

  cachedFlatList = list;
  return list;
}

function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function useVNLocationSuggestions(
  query: string,
  limit = 8
): VNLocationSuggestion[] {
  return useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < 1) return [];

    const flat = buildFlatList();
    const results: VNLocationSuggestion[] = [];
    for (const item of flat) {
      if (normalize(item.label).includes(q)) {
        results.push(item);
        if (results.length >= limit) break;
      }
    }
    return results;
  }, [query, limit]);
}
