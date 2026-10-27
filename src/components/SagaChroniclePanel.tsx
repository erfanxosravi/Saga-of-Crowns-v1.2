import { useState } from 'react';
import { Award, BookOpen, Check, Copy, Flame, GitBranch } from 'lucide-react';
import { BITLIFE_ACHIEVEMENTS } from '../data/deathsAndAchievements';
import { calculateLegacyScore } from '../engine/gameEngine';
import { formatDynastyName, formatPersonName } from '../i18n/gameDataFa';
import { SHORT_TITLE_LABELS } from '../i18n/ui';
import { FullGameState } from '../types/game';
import longhouseHearthUrl from '../assets/images/norse_longhouse_hearth_fire_1793047791880.jpg';
import { NorseCornerOrnament, RuneDivider } from './NorseMotifs';

interface SagaChroniclePanelProps {
  state: FullGameState;
}

export function SagaChroniclePanel({ state }: SagaChroniclePanelProps) {
  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const [subTab, setSubTab] = useState<'badges' | 'ancestors' | 'history'>('badges');
  const [imgFailed, setImgFailed] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  const legacyScore = calculateLegacyScore(state);

  const handleCopySeed = () => {
    navigator.clipboard?.writeText(state.seedString).catch(() => {});
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1800);
  };

  const divergencesList = isFa
    ? state.divergencesFa && state.divergencesFa.length > 0
      ? state.divergencesFa
      : state.divergences
    : state.divergences;

  const unlockedCount = BITLIFE_ACHIEVEMENTS.filter((ach) => {
    const p = ach.getProgress(state);
    return state.achievements.includes(ach.id) || p.current >= p.target;
  }).length;

  return (
    <div className="space-y-4 text-start">
      {/* Nordic Dynasty Banner (wrapped titles, min 12px) */}
      <div className="relative min-h-[144px] rounded-2xl overflow-hidden border border-[#24364D] bg-[#0F1722] flex flex-col justify-end p-4">
        {!imgFailed ? (
          <img
            src={longhouseHearthUrl}
            alt="Norse longhouse hearth"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#131D2B]">
            <Flame className="w-8 h-8 text-[#F59E0B]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1118] via-[#0B1118]/70 to-transparent" />

        <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-mono text-[#38BDF8] whitespace-normal break-words">
              {isFa
                ? `نسل ${state.generation} · کد دنیا ${state.seedString}`
                : `Gen ${state.generation} · Seed ${state.seedString}`}
            </div>
            <h2 className="font-saga text-2xl font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug mt-0.5">
              {formatDynastyName(state.dynastyName, lang)}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="text-end">
              <div className="text-xs text-[#CBD5E1]">
                {isFa ? 'امتیاز میراث' : 'Legacy Score'}
              </div>
              <div className="text-lg font-mono font-bold tabular-nums text-[#FBBF24]">
                {legacyScore.toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopySeed}
              title={isFa ? 'کپی کد دنیا' : 'Copy Seed'}
              aria-label={isFa ? 'کپی کد دنیا' : 'Copy Seed'}
              className="min-w-[44px] min-h-[44px] px-2.5 rounded-xl bg-[#131D2B]/90 border border-[#283B52] hover:border-[#38BDF8] text-[#F1F5F9] flex items-center justify-center cursor-pointer transition-colors"
            >
              {copiedSeed ? (
                <Check className="w-4 h-4 text-[#34D399]" />
              ) : (
                <Copy className="w-4 h-4 text-[#CBD5E1]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs (44px touch targets, min 12px text, clean wrapping) */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#0B1118] border border-[#1E2D40] rounded-2xl">
        <button
          type="button"
          onClick={() => setSubTab('badges')}
          className={`min-h-[44px] min-w-0 px-2 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === 'badges'
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight text-center">
            {isFa
              ? `چالش‌ها (${unlockedCount}/${BITLIFE_ACHIEVEMENTS.length})`
              : `Challenges (${unlockedCount}/${BITLIFE_ACHIEVEMENTS.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('ancestors')}
          className={`min-h-[44px] min-w-0 px-2 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === 'ancestors'
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight text-center">
            {isFa ? `نیاکان (${state.ancestors.length})` : `Lineage (${state.ancestors.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('history')}
          className={`min-h-[44px] min-w-0 px-2 py-1.5 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            subTab === 'history'
              ? 'bg-[#38BDF8] text-[#0B1118]'
              : 'text-[#CBD5E1] hover:text-[#F1F5F9]'
          }`}
        >
          <GitBranch className="w-4 h-4 shrink-0" />
          <span className="whitespace-normal leading-tight text-center">
            {isFa
              ? `تاریخ بدیل (${divergencesList.length})`
              : `Alt-History (${divergencesList.length})`}
          </span>
        </button>
      </div>

      <RuneDivider accent="amber" />

      {subTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BITLIFE_ACHIEVEMENTS.map((ach) => {
            const prog = ach.getProgress(state);
            const earned = state.achievements.includes(ach.id) || prog.current >= prog.target;
            const pct = Math.min(100, Math.round((prog.current / Math.max(1, prog.target)) * 100));

            return (
              <div
                key={ach.id}
                className={`relative p-4 rounded-2xl border space-y-2.5 transition-colors overflow-hidden ${
                  earned
                    ? 'bg-gradient-to-br from-[#1B1913] via-[#132030] to-[#0F1722] border-[#F59E0B]/70 text-[#F1F5F9]'
                    : 'bg-[#131D2B] border-[#233246] text-[#CBD5E1]'
                }`}
              >
                {earned && <NorseCornerOrnament accent="amber" />}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="text-sm font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                    {isFa ? ach.nameFa : ach.nameEn}
                  </div>
                  <span
                    className={`text-xs font-mono font-bold tabular-nums shrink-0 ${
                      earned ? 'text-[#FBBF24]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {earned ? '✓' : `${prog.current}/${prog.target}`}
                  </span>
                </div>
                <div className="text-xs text-[#94A3B8] whitespace-normal break-words leading-relaxed">
                  {isFa ? ach.descFa : ach.descEn}
                </div>
                <svg
                  viewBox="0 0 100 6"
                  preserveAspectRatio="none"
                  className="h-2 w-full rounded-xs overflow-hidden block"
                  aria-hidden="true"
                >
                  <rect x="0" y="0" width="100" height="6" className="fill-[#090E15]" />
                  <rect
                    x={isFa ? 100 - pct : 0}
                    y="0"
                    width={pct}
                    height="6"
                    className={`transition-all duration-300 ${
                      earned ? 'fill-[#F59E0B]' : 'fill-[#38BDF8]/65'
                    }`}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {subTab === 'ancestors' && (
        <div className="space-y-3">
          {state.ancestors.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#131D2B] border border-[#233246] text-xs text-[#94A3B8] text-center leading-relaxed">
              {isFa
                ? `«${formatPersonName(state.character.givenName, 'fa')}» نسل اول خاندان شماست. پس از مرگ و ادامه بازی با وارث، کارنامه فرمانروایان پیشین در اینجا ثبت می‌شود.`
                : `${state.character.givenName} is Generation 1. Past rulers and their obituaries appear here when you continue as an heir.`}
            </div>
          ) : (
            state.ancestors.map((anc) => (
              <div
                key={anc.id}
                className="relative p-4 rounded-2xl bg-[#131D2B] border border-[#233246] space-y-2 overflow-hidden"
              >
                <NorseCornerOrnament accent="amber" />
                <div className="flex flex-wrap justify-between gap-2 text-xs text-[#38BDF8] font-mono tabular-nums">
                  <span>
                    {isFa
                      ? `نسل ${anc.generation} · ${SHORT_TITLE_LABELS.fa[anc.title]}`
                      : `Gen ${anc.generation} · ${SHORT_TITLE_LABELS.en[anc.title]}`}
                  </span>
                  <span>
                    {isFa
                      ? `${anc.birthYear}–${anc.deathYear} م (${anc.ageAtDeath} سال)`
                      : `${anc.birthYear}–${anc.deathYear} AD (Age ${anc.ageAtDeath})`}
                  </span>
                </div>
                <div className="font-saga text-lg font-bold text-[#F1F5F9] whitespace-normal break-words leading-snug">
                  {formatPersonName(anc.fullName.replace(/"/g, ''), lang)}
                </div>
                <p className="text-xs sm:text-sm text-[#CBD5E1] whitespace-normal break-words leading-relaxed">
                  {isFa ? anc.obituaryProseFa ?? anc.obituaryProse : anc.obituaryProse}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'history' && (
        <div className="space-y-2.5">
          {divergencesList.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#131D2B] border border-[#233246] text-xs text-[#94A3B8] text-center leading-relaxed">
              {isFa
                ? 'مسیر تاریخ هنوز مطابق روایت‌های واقعی پیش می‌رود. با رقم‌زدن انتخاب‌های متفاوت در رویدادهای بزرگ تاریخی، تغییرات شما در اینجا ثبت می‌شود.'
                : 'History still flows on its recorded course. Alter major historical events to record divergences here.'}
            </div>
          ) : (
            divergencesList.map((d, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#131D2B] border border-[#38BDF8]/40 font-saga text-base text-[#F1F5F9] whitespace-normal break-words leading-relaxed"
              >
                ᛫ {d}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
