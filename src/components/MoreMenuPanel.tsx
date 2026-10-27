import { ReactNode } from 'react';
import { BookOpen, Castle, Crown, Save, Ship, Trophy } from 'lucide-react';
import { BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import { getClaimableNextTitle } from '../engine/gameEngine';
import { SHORT_TITLE_LABELS } from '../i18n/ui';
import { FullGameState, TabId } from '../types/game';
import { NorseAccent, NorseCornerOrnament, RuneDivider } from './NorseMotifs';

export type RealmSection = 'holdings' | 'fleet' | 'intrigue';

interface MoreMenuPanelProps {
  state: FullGameState;
  onNavigateTab: (tab: TabId, realmSection?: RealmSection) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onClaimRank?: () => void;
}

interface MoreTileDef {
  id: string;
  title: string;
  summary: string;
  icon: ReactNode;
  accent: NorseAccent;
  surfaceClass: string;
  iconBoxClass: string;
  spanFullMobile?: boolean;
  onClick: () => void;
}

export function MoreMenuPanel({
  state,
  onNavigateTab,
  onOpenSettings,
  onOpenGuide,
  onClaimRank,
}: MoreMenuPanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const claimable = getClaimableNextTitle(state);
  const r = state.realm;

  const totalShips = r.longships + r.knarrs;
  const unlockedCount = BITLIFE_ACHIEVEMENTS.filter((ach) => {
    const p = ach.getProgress(state);
    return state.achievements.includes(ach.id) || p.current >= p.target;
  }).length;

  const audioOn = state.settings.ambientAudioEnabled || state.settings.soundEnabled;

  const tiles: MoreTileDef[] = [
    {
      id: 'holdings',
      title: isFa ? 'املاک و ساختمان‌ها' : 'Holdings',
      summary: isFa
        ? `${r.holdings.length} ملک · ${r.landFarms} مزرعه`
        : `${r.holdings.length} ${r.holdings.length === 1 ? 'estate' : 'estates'} · ${r.landFarms} ${r.landFarms === 1 ? 'farm' : 'farms'}`,
      icon: <Castle className="w-6 h-6" />,
      accent: 'amber',
      surfaceClass:
        'bg-gradient-to-br from-[#1C1914] via-[#131D2B] to-[#111926] border-[#F59E0B]/40 hover:border-[#F59E0B]',
      iconBoxClass: 'bg-[#F59E0B]/15 text-[#F59E0B] ring-1 ring-[#F59E0B]/30',
      onClick: () => onNavigateTab(TabId.Realm, 'holdings'),
    },
    {
      id: 'fleet',
      title: isFa ? 'ناوگان و سپاه' : 'Fleet',
      summary: isFa
        ? `${totalShips} کشتی · ${r.hirdWarriors} جنگجو`
        : `${totalShips} ${totalShips === 1 ? 'ship' : 'ships'} · ${r.hirdWarriors} ${r.hirdWarriors === 1 ? 'warrior' : 'warriors'}`,
      icon: <Ship className="w-6 h-6" />,
      accent: 'ice',
      surfaceClass:
        'bg-gradient-to-br from-[#102033] via-[#131D2B] to-[#111926] border-[#38BDF8]/40 hover:border-[#38BDF8]',
      iconBoxClass: 'bg-[#38BDF8]/15 text-[#38BDF8] ring-1 ring-[#38BDF8]/30',
      onClick: () => onNavigateTab(TabId.Realm, 'fleet'),
    },
    {
      id: 'intrigue',
      title: isFa ? 'دسیسه‌ها و تاج‌ها' : 'Intrigue & Crown',
      summary: isFa
        ? `${state.specialTitles?.length ?? 0} عنوان ویژه · توطئه‌ها و ترور`
        : `${state.specialTitles?.length ?? 0} historical titles · Plots & poison`,
      icon: <Crown className="w-6 h-6" />,
      accent: 'amber',
      surfaceClass:
        'bg-gradient-to-br from-[#241520] via-[#131D2B] to-[#111926] border-[#E11D48]/40 hover:border-[#F43F5E]',
      iconBoxClass: 'bg-[#F43F5E]/15 text-[#FB7185] ring-1 ring-[#F43F5E]/30',
      onClick: () => onNavigateTab(TabId.Realm, 'intrigue'),
    },
    {
      id: 'legacy',
      title: isFa ? 'دستاوردها و میراث' : 'Achievements & Legacy',
      summary: isFa
        ? `نسل ${state.generation} · ${unlockedCount} دستاورد · شهرت ${r.fame}`
        : `Gen ${state.generation} · ${unlockedCount} unlocked · ${r.fame} fame`,
      icon: <Trophy className="w-6 h-6" />,
      accent: 'amber',
      surfaceClass:
        'bg-gradient-to-br from-[#231612] via-[#131D2B] to-[#111926] border-[#FB923C]/40 hover:border-[#FB923C]',
      iconBoxClass: 'bg-[#FB923C]/15 text-[#FB923C] ring-1 ring-[#FB923C]/30',
      onClick: () => onNavigateTab(TabId.Saga),
    },
    {
      id: 'settings',
      title: isFa ? 'ذخیره و تنظیمات' : 'Saves & Settings',
      summary: isFa
        ? `سال ${state.year} · ۳ جایگاه ذخیره · صدا ${audioOn ? 'روشن' : 'خاموش'}`
        : `${state.year} AD · 3 save slots · Audio ${audioOn ? 'on' : 'off'}`,
      icon: <Save className="w-6 h-6" />,
      accent: 'emerald',
      surfaceClass:
        'bg-gradient-to-br from-[#10221E] via-[#131D2B] to-[#111926] border-[#34D399]/35 hover:border-[#34D399]',
      iconBoxClass: 'bg-[#34D399]/15 text-[#34D399] ring-1 ring-[#34D399]/30',
      onClick: onOpenSettings,
    },
    {
      id: 'guide',
      title: isFa ? 'راهنما و واژه‌نامه' : 'Guide & Glossary',
      summary: isFa
        ? 'قوانین بازی، غارت، جانشینی و ۶ اصطلاح نورس'
        : 'Rules, raids, succession & 6 Norse terms',
      icon: <BookOpen className="w-6 h-6" />,
      accent: 'violet',
      surfaceClass:
        'bg-gradient-to-br from-[#18182C] via-[#131D2B] to-[#111926] border-[#A78BFA]/35 hover:border-[#A78BFA]',
      iconBoxClass: 'bg-[#A78BFA]/15 text-[#A78BFA] ring-1 ring-[#A78BFA]/30',
      spanFullMobile: true,
      onClick: onOpenGuide,
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden space-y-4 text-start">
      {/* Rank Promotion Callout when Eligible */}
      {claimable && (
        <div className="relative p-4 rounded-2xl bg-gradient-to-r from-[#261B0D] via-[#1B1915] to-[#131D2B] border border-[#F59E0B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden">
          <NorseCornerOrnament accent="amber" />
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] ring-1 ring-[#F59E0B]/40 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                {isFa
                  ? `آماده ارتقا به مقام «${SHORT_TITLE_LABELS.fa[claimable]}»!`
                  : `Ready to Claim Rank: ${SHORT_TITLE_LABELS.en[claimable]}`}
              </div>
              <p className="text-xs text-[#CBD5E1] whitespace-normal break-words leading-relaxed mt-0.5">
                {isFa
                  ? 'شرایط املاک، شهرت و سپاه برای ارتقای مقام خاندان فراهم شده است.'
                  : 'Your estates, fame, and warband meet the requirements for a higher title.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onClaimRank) {
                onClaimRank();
              } else {
                onNavigateTab(TabId.Realm, 'holdings');
              }
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1118] text-xs font-extrabold cursor-pointer shrink-0 transition-colors"
          >
            {isFa
              ? `ارتقا به ${SHORT_TITLE_LABELS.fa[claimable]}`
              : `Claim ${SHORT_TITLE_LABELS.en[claimable]}`}
          </button>
        </div>
      )}

      <RuneDivider
        label={isFa ? 'مدیریت قلمرو، میراث و ابزارها' : 'Realm, Legacy & Chronicle'}
        accent="amber"
      />

      {/* Grid of Large Icon Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            onClick={tile.onClick}
            className={`relative min-h-[138px] p-4 rounded-2xl border text-start flex flex-col justify-between gap-3.5 transition-all active:scale-[0.98] cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/70 ${
              tile.surfaceClass
            } ${tile.spanFullMobile ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <NorseCornerOrnament accent={tile.accent} />

            <div className="flex items-start justify-between gap-2">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tile.iconBoxClass}`}
              >
                {tile.icon}
              </div>
              {tile.id === 'holdings' && claimable && (
                <span className="text-xs font-bold text-[#FBBF24] whitespace-normal text-end leading-tight">
                  {isFa ? 'ارتقا آماده' : 'Rank Ready'}
                </span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="text-sm sm:text-base font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                {tile.title}
              </div>
              <div className="text-xs text-[#CBD5E1] font-mono tabular-nums whitespace-normal break-words leading-relaxed">
                {tile.summary}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
