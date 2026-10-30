import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  Crown,
  Download,
  Flame,
  Share2,
  Shield,
  Skull,
  Sparkles,
  Swords,
  X,
} from 'lucide-react';
import { SETTLEMENTS_BY_ID } from '../data/geography';
import { ALL_TRAITS_MAP } from '../data/namesAndTraits';
import { evaluateLifeReportTitle } from '../data/deathsAndAchievements';
import { calculateLegacyScore } from '../engine/gameEngine';
import {
  formatDynastyName,
  formatPersonName,
  SETTLEMENTS_FA,
  TRAITS_FA,
} from '../i18n/gameDataFa';
import {
  EPITHET_FA,
  isRtl,
  RELIGION_LABELS,
  SHORT_TITLE_LABELS,
  TITLE_LABELS,
} from '../i18n/ui';
import { FullGameState } from '../types/game';
import { useModalA11y } from '../utils/useModalA11y';
import { VikingPortrait } from './VikingPortrait';

export type PosterThemeId = 'valhalla_gold' | 'nordic_parchment' | 'fjord_aurora';

interface SagaSharePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FullGameState;
}

interface PosterPalette {
  id: PosterThemeId;
  nameFa: string;
  nameEn: string;
  bgTop: string;
  bgMid: string;
  bgBot: string;
  cardBg: string;
  cardBorder: string;
  outerFrame: string;
  innerFrame: string;
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  accentPrimary: string;
  accentSecondary: string;
  quoteBg: string;
  quoteBorder: string;
  statBoxBg: string;
  statBoxBorder: string;
  badgeBg: string;
  badgeText: string;
}

const POSTER_THEMES: Record<PosterThemeId, PosterPalette> = {
  valhalla_gold: {
    id: 'valhalla_gold',
    nameFa: 'تالار والهالا (زرین)',
    nameEn: 'Valhalla Gold',
    bgTop: '#0B111C',
    bgMid: '#131E30',
    bgBot: '#090E17',
    cardBg: 'rgba(22, 34, 52, 0.85)',
    cardBorder: 'rgba(245, 158, 11, 0.42)',
    outerFrame: '#D97706',
    innerFrame: 'rgba(251, 191, 36, 0.38)',
    primaryText: '#F8FAFC',
    secondaryText: '#E2E8F0',
    mutedText: '#94A3B8',
    accentPrimary: '#F59E0B',
    accentSecondary: '#38BDF8',
    quoteBg: 'rgba(38, 25, 14, 0.78)',
    quoteBorder: 'rgba(245, 158, 11, 0.55)',
    statBoxBg: 'rgba(15, 24, 38, 0.9)',
    statBoxBorder: 'rgba(56, 189, 248, 0.28)',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    badgeText: '#FCD34D',
  },
  nordic_parchment: {
    id: 'nordic_parchment',
    nameFa: 'طومار کهن (پوست آهو)',
    nameEn: 'Ancient Parchment',
    bgTop: '#F5EFE2',
    bgMid: '#EDE3CE',
    bgBot: '#E2D4B7',
    cardBg: 'rgba(255, 252, 245, 0.88)',
    cardBorder: 'rgba(180, 83, 9, 0.38)',
    outerFrame: '#92400E',
    innerFrame: 'rgba(146, 64, 14, 0.35)',
    primaryText: '#1C1917',
    secondaryText: '#292524',
    mutedText: '#57534E',
    accentPrimary: '#B45309',
    accentSecondary: '#0369A1',
    quoteBg: 'rgba(254, 243, 199, 0.75)',
    quoteBorder: 'rgba(180, 83, 9, 0.45)',
    statBoxBg: 'rgba(250, 245, 232, 0.95)',
    statBoxBorder: 'rgba(168, 144, 112, 0.55)',
    badgeBg: 'rgba(180, 83, 9, 0.12)',
    badgeText: '#92400E',
  },
  fjord_aurora: {
    id: 'fjord_aurora',
    nameFa: 'شفق قطبی و فیورد',
    nameEn: 'Fjord Aurora',
    bgTop: '#071624',
    bgMid: '#0D263B',
    bgBot: '#06101B',
    cardBg: 'rgba(14, 34, 54, 0.85)',
    cardBorder: 'rgba(52, 211, 153, 0.42)',
    outerFrame: '#10B981',
    innerFrame: 'rgba(56, 189, 248, 0.38)',
    primaryText: '#F0FDFA',
    secondaryText: '#CCFBF1',
    mutedText: '#94A3B8',
    accentPrimary: '#34D399',
    accentSecondary: '#38BDF8',
    quoteBg: 'rgba(13, 42, 48, 0.78)',
    quoteBorder: 'rgba(52, 211, 153, 0.5)',
    statBoxBg: 'rgba(10, 25, 41, 0.9)',
    statBoxBorder: 'rgba(56, 189, 248, 0.32)',
    badgeBg: 'rgba(52, 211, 153, 0.16)',
    badgeText: '#6EE7B7',
  },
};

function wrapCanvasParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Generates a deeply meaningful, literary biography narrative of the character's life
 * based on their birthplace, deeds, battles, holdings, family, and final fate.
 */
function buildMeaningfulBiography(state: FullGameState, isFa: boolean): {
  narrative: string;
  philosophicalQuote: string;
  highlights: { age: number; year: number; title: string }[];
} {
  const c = state.character;
  const r = state.realm;
  const death = state.pendingDeath;
  const fullName = formatPersonName(`${c.givenName} ${c.patronymic}`, state.settings.language);
  const birthCity = SETTLEMENTS_BY_ID[c.birthplaceId];
  const birthCityName = isFa
    ? (SETTLEMENTS_FA[c.birthplaceId]?.name ?? birthCity?.name ?? c.birthplaceId).split(' (')[0]
    : (birthCity?.name ?? c.birthplaceId).split(' (')[0];

  const currentCity = SETTLEMENTS_BY_ID[c.locationId];
  const currentCityName = isFa
    ? (SETTLEMENTS_FA[c.locationId]?.name ?? currentCity?.name ?? c.locationId).split(' (')[0]
    : (currentCity?.name ?? c.locationId).split(' (')[0];

  const childrenCount = state.relationships.filter((rel) => rel.role === 'Child' && rel.alive).length;
  const spouse = state.relationships.find((rel) => rel.role === 'Spouse' && rel.alive);
  const rankTitle = TITLE_LABELS[state.settings.language][c.title];

  // Pick up to 3 memorable milestones from lifeLog
  const notableLogs = [...state.lifeLog]
    .filter(
      (entry) =>
        Boolean(entry.isDivergence || entry.isSemiLegendary) ||
        entry.category === 'Raiding' ||
        entry.category === 'War' ||
        entry.category === 'Politics & Kings' ||
        entry.category === 'Historical Set-Piece' ||
        entry.category === 'Voyage & Sea' ||
        entry.category === 'Chronicle'
    )
    .slice(-3);

  const highlights: { age: number; year: number; title: string }[] = notableLogs.map((entry) => ({
    age: entry.age,
    year: entry.year,
    title: isFa
      ? entry.titleFa ?? entry.title ?? entry.textFa ?? entry.text
      : entry.title ?? entry.text,
  }));

  if (isFa) {
    const originPart = `حماسه «${fullName}» در سال ${c.birthYear} میلادی در سواحل «${birthCityName}» آغاز شد و تا مقام «${rankTitle}» اوج گرفت.`;
    const deedsPart =
      c.raidsLed > 0 || c.killsInHolmgang > 0
        ? `او در طول ${c.age} سال زندگی پرفرازونشیب، ${c.raidsLed} بار بادبان کشتی‌های اژدها را برای یورش برافراشت، در ${c.killsInHolmgang} دوئل هولم‌گانگ پیروز شد و ${r.landFarms} مزرعه در ${r.holdings.length} سرزمین بنیان نهاد.`
        : `او در طول ${c.age} سال زندگی، با تدبیر و خردمندی ${r.landFarms} مزرعه آباد کرد، ${r.silver} سکه نقره در خزانه اندوخت و آوازه‌اش به ${r.fame} رسید.`;

    const familyPart =
      childrenCount > 0
        ? `میراث خون او در رگ‌های ${childrenCount} فرزند زنده و نسل ${state.generation} «${formatDynastyName(state.dynastyName, 'fa')}» جاودانه ماند.`
        : spouse
          ? `او در کنار همسرش «${formatPersonName(spouse.name, 'fa')}» در «${currentCityName}» نامی ماندگار از خود به یادگار گذاشت.`
          : `نام و آوازه او در تالارهای «${currentCityName}» سینه به سینه در شعر اسکالدها روایت خواهد شد.`;

    const fatePart = death
      ? `سرانجام در سال ${state.year} میلادی: ${death.causeOfDeathFa ?? death.causeOfDeath}`
      : `اکنون در سال ${state.year} میلادی، پرچم فرمانروایی او بر فراز «${currentCityName}» در اهتزاز است.`;

    const quotes = [
      '«گله‌ها می‌میرند، خویشاوندان می‌میرند، و تو نیز روزی خواهی مرد؛ اما یک چیز هرگز نمی‌میرد: نام نیک و آوازه کسی که با شرافت زیسته است.» — هاوامال (سخنان اودین)',
      '«نه از طوفان دریا هراسید و نه از تیغ دشمن؛ سرنوشت هر انسان از پیش در تار و پود نورن‌ها تنیده شده است.» — سرود اسکالدهای شمال',
      '«طلا و نقره در خاک می‌پوسند، اما حماسه‌ای که با خون و شهامت نوشته شود تا ابد در والهالا طنین‌انداز خواهد ماند.»',
    ];
    const quoteIdx = (c.age + c.raidsLed + state.generation) % quotes.length;

    return {
      narrative: `${originPart} ${deedsPart} ${familyPart} ${fatePart}`,
      philosophicalQuote: quotes[quoteIdx],
      highlights,
    };
  }

  const originEn = `Born at ${birthCityName} in ${c.birthYear} AD, ${fullName} rose through fire and salt to rule as ${rankTitle}.`;
  const deedsEn =
    c.raidsLed > 0 || c.killsInHolmgang > 0
      ? `Across ${c.age} winters, this warrior led ${c.raidsLed} sea raids, triumphed in ${c.killsInHolmgang} holmgang duels, and forged a realm of ${r.landFarms} farms across ${r.holdings.length} holdings.`
      : `Across ${c.age} winters of shrewd rule, ${c.givenName} cultivated ${r.landFarms} estates, amassed ${r.silver} silver, and earned ${r.fame} renown.`;
  const familyEn =
    childrenCount > 0
      ? `The bloodline endures through ${childrenCount} living children in Generation ${state.generation} of ${state.dynastyName}.`
      : `In the great halls of ${currentCityName}, skalds will sing of this saga for generations.`;
  const fateEn = death
    ? `Final Fate (${state.year} AD): ${death.causeOfDeath}`
    : `Reigning at ${currentCityName} in the year ${state.year} AD.`;

  const quotesEn = [
    '"Cattle die, kinsmen die, you yourself shall die; Set one thing that never dies: the fair fame of one who has earned it." — Hávamál',
    '"Fear neither the howling gale nor the shield-wall; a warrior’s Wyrd is woven before their first breath."',
    '"Silver tarnishes in the earth, but a saga carved in courage echoes forever in the rafters of Valhalla."',
  ];
  const quoteIdx = (c.age + c.raidsLed + state.generation) % quotesEn.length;

  return {
    narrative: `${originEn} ${deedsEn} ${familyEn} ${fateEn}`,
    philosophicalQuote: quotesEn[quoteIdx],
    highlights,
  };
}

export function SagaSharePosterModal({
  isOpen,
  onClose,
  state,
}: SagaSharePosterModalProps) {
  const defaultPosterTheme: PosterThemeId =
    (state.settings.theme ?? 'light') === 'light' ? 'nordic_parchment' : 'valhalla_gold';
  const [themeId, setThemeId] = useState<PosterThemeId>(defaultPosterTheme);
  const [quoteIdx, setQuoteIdx] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const hiddenPortraitWrapRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useModalA11y<HTMLDivElement>({
    isOpen,
    onClose,
  });

  useEffect(() => {
    setThemeId((state.settings.theme ?? 'light') === 'light' ? 'nordic_parchment' : 'valhalla_gold');
  }, [state.settings.theme]);

  if (!isOpen) return null;

  const lang = state.settings.language;
  const isFa = lang === 'fa';
  const rtl = isRtl(lang);
  const c = state.character;
  const r = state.realm;
  const death = state.pendingDeath;
  const pal = POSTER_THEMES[themeId];

  const fullName = formatPersonName(`${c.givenName} ${c.patronymic}`, lang);
  const epText = c.epithet
    ? isFa
      ? ` «${EPITHET_FA[c.epithet] ?? c.epithet}»`
      : ` "${c.epithet}"`
    : '';

  const fallbackReport = evaluateLifeReportTitle(state);
  const sagaTitle = death
    ? isFa
      ? death.lifeTitleFa ?? fallbackReport.titleFa
      : death.lifeTitle ?? fallbackReport.titleEn
    : isFa
      ? fallbackReport.titleFa
      : fallbackReport.titleEn;

  const legacyScore = death ? death.legacyScore : calculateLegacyScore(state);
  const childrenCount = state.relationships.filter((rel) => rel.role === 'Child' && rel.alive).length;
  const bio = buildMeaningfulBiography(state, isFa);

  const customQuotesFa = [
    bio.philosophicalQuote,
    '«گله‌ها می‌میرند و خویشاوندان نیز؛ اما نام نیک و آوازه شجاعان هرگز نخواهد مرد.» — هاوامال',
    '«ما برای ترسیدن به این جهان نیامده‌ایم؛ ما آمده‌ایم تا داستانی بسازیم که خدایان در آسگارد به آن رشک ببرند.»',
  ];
  const customQuotesEn = [
    bio.philosophicalQuote,
    '"Cattle die, kinsmen die; one thing never dies: the judgment on each one dead." — Hávamál',
    '"We did not sail into the storm to live forever — we sailed so the skalds would never forget our names."',
  ];
  const activeQuote = isFa
    ? customQuotesFa[quoteIdx % customQuotesFa.length]
    : customQuotesEn[quoteIdx % customQuotesEn.length];

  const traitNames = c.traits
    .slice(0, 4)
    .map((tid) => (isFa ? TRAITS_FA[tid]?.name ?? ALL_TRAITS_MAP[tid]?.name ?? tid : ALL_TRAITS_MAP[tid]?.name ?? tid));

  const statsItems = isFa
    ? [
        { label: 'امتیاز میراث', value: legacyScore.toLocaleString(), sub: `نسل ${state.generation}` },
        { label: 'عمر و دوران', value: `${c.age} سال`, sub: `${c.birthYear}–${state.year} م` },
        { label: 'غارت و نبرد', value: `${c.raidsLed} یورش`, sub: `${c.killsInHolmgang} پیروزی دوئل` },
        { label: 'خزانه و شهرت', value: `${r.silver} نقره`, sub: `${r.fame} شهرت` },
        { label: 'قلمرو و املاک', value: `${r.landFarms} مزرعه`, sub: `${r.holdings.length} شهر تحت فرمان` },
        { label: 'فرزندان و سپاه', value: `${childrenCount} فرزند`, sub: `${r.hirdWarriors} جنگجوی هیرد` },
      ]
    : [
        { label: 'LEGACY SCORE', value: legacyScore.toLocaleString(), sub: `Gen ${state.generation}` },
        { label: 'YEARS LIVED', value: `Age ${c.age}`, sub: `${c.birthYear}–${state.year} AD` },
        { label: 'RAIDS & DUELS', value: `${c.raidsLed} Raids`, sub: `${c.killsInHolmgang} Duels Won` },
        { label: 'HOARD & FAME', value: `${r.silver} Silver`, sub: `${r.fame} Renown` },
        { label: 'REALM ESTATES', value: `${r.landFarms} Farms`, sub: `${r.holdings.length} Cities` },
        { label: 'HEIRS & HIRD', value: `${childrenCount} Heirs`, sub: `${r.hirdWarriors} Warriors` },
      ];

  /**
   * Renders a high-resolution 1080x1920 (9:16 Instagram Story) poster with the actual
   * SVG character portrait, ornate Nordic borders, biography narrative, and stats.
   */
  const handleExportPoster = async (mode: 'download' | 'share') => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.direction = isFa ? 'rtl' : 'ltr';
      const fontMain = isFa ? '"Vazirmatn", system-ui, sans-serif' : '"Cormorant Garamond", Georgia, serif';
      const fontBody = isFa ? '"Vazirmatn", system-ui, sans-serif' : '"Plus Jakarta Sans", system-ui, sans-serif';

      // 1. Rich Multi-Stop Atmospheric Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, pal.bgTop);
      bgGrad.addColorStop(0.5, pal.bgMid);
      bgGrad.addColorStop(1, pal.bgBot);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle Radial Glow Behind Portrait
      const haloGrad = ctx.createRadialGradient(540, 410, 40, 540, 410, 440);
      haloGrad.addColorStop(
        0,
        themeId === 'nordic_parchment'
          ? 'rgba(217, 119, 6, 0.22)'
          : themeId === 'fjord_aurora'
            ? 'rgba(52, 211, 153, 0.22)'
            : 'rgba(245, 158, 11, 0.24)'
      );
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, canvas.width, 900);

      // 2. Ornate Double Nordic Runestone Border & Corner Interlace
      ctx.strokeStyle = pal.outerFrame;
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, 36, 36, canvas.width - 72, canvas.height - 72, 32);
      ctx.stroke();

      ctx.strokeStyle = pal.innerFrame;
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, 54, 54, canvas.width - 108, canvas.height - 108, 24);
      ctx.stroke();

      // Corner Runic Diamonds
      const corners = [
        [74, 74],
        [canvas.width - 74, 74],
        [74, canvas.height - 74],
        [canvas.width - 74, canvas.height - 74],
      ];
      ctx.fillStyle = pal.accentPrimary;
      for (const [cx, cy] of corners) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-8, -8, 16, 16);
        ctx.restore();
      }

      // 3. Top Header Kicker & Elder Futhark Rune Ribbon
      ctx.textAlign = 'center';
      ctx.fillStyle = pal.accentPrimary;
      ctx.font = `bold 24px ${fontBody}`;
      ctx.fillText('ᛟ   ᛋ ᚨ ᚷ ᚨ   ᛟ ᚠ   ᚲ ᚱ ᛟ ᚹ ᚾ ᛋ   ᛟ', 540, 108);

      ctx.fillStyle = pal.mutedText;
      ctx.font = `bold 25px ${fontBody}`;
      ctx.fillText(
        isFa
          ? `طومار سرنوشت و کارنامه زندگی · ${formatDynastyName(state.dynastyName, 'fa')}`
          : `CHRONICLE OF A VIKING LIFE · ${state.dynastyName.toUpperCase()}`,
        540,
        152
      );

      // 4. Render Actual SVG Character Portrait onto Canvas
      const svgEl = hiddenPortraitWrapRef.current?.querySelector('svg');
      if (svgEl) {
        const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clonedSvg.setAttribute('width', '320');
        clonedSvg.setAttribute('height', '320');
        const svgXml = new XMLSerializer().serializeToString(clonedSvg);
        const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml)}`;

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            // Ornate Outer Portrait Ring
            ctx.save();
            ctx.strokeStyle = pal.accentPrimary;
            ctx.lineWidth = 6;
            drawRoundedRect(ctx, 390, 190, 300, 300, 56);
            ctx.stroke();
            ctx.drawImage(img, 394, 194, 292, 292);
            ctx.restore();
            resolve();
          };
          img.onerror = () => resolve();
          img.src = svgUrl;
        });
      }

      // 5. Character Full Name, Epithet & Noble Rank
      ctx.fillStyle = pal.primaryText;
      ctx.font = `bold 58px ${fontMain}`;
      const nameLines = wrapCanvasParagraph(ctx, `${fullName}${epText}`, 900).slice(0, 2);
      let cursorY = 556;
      nameLines.forEach((ln) => {
        ctx.fillText(ln, 540, cursorY);
        cursorY += 64;
      });

      ctx.fillStyle = pal.accentSecondary;
      ctx.font = `bold 30px ${fontBody}`;
      ctx.fillText(
        isFa
          ? `${TITLE_LABELS.fa[c.title]} · آیین: ${RELIGION_LABELS.fa[c.religion]}`
          : `${TITLE_LABELS.en[c.title]} · ${RELIGION_LABELS.en[c.religion]}`,
        540,
        cursorY + 4
      );
      cursorY += 46;

      // Earned Saga Title Pill Banner
      drawRoundedRect(ctx, 140, cursorY, 800, 76, 20);
      ctx.fillStyle = pal.badgeBg;
      ctx.fill();
      ctx.strokeStyle = pal.outerFrame;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = pal.badgeText;
      ctx.font = `bold 34px ${fontMain}`;
      ctx.fillText(
        isFa ? `👑 لقب حماسه: ${sagaTitle}` : `👑 Saga Title: ${sagaTitle}`,
        540,
        cursorY + 49
      );
      cursorY += 102;

      // Trait Pills Row
      if (traitNames.length > 0) {
        ctx.fillStyle = pal.mutedText;
        ctx.font = `bold 24px ${fontBody}`;
        ctx.fillText(
          isFa
            ? `ویژگی‌های شخصیت: ${traitNames.join('  ·  ')}`
            : `Character Traits: ${traitNames.join('  ·  ')}`,
          540,
          cursorY + 14
        );
        cursorY += 42;
      }

      // 6. Meaningful Biographical Life Story Box
      const bioBoxHeight = 350;
      drawRoundedRect(ctx, 84, cursorY, 912, bioBoxHeight, 24);
      ctx.fillStyle = pal.cardBg;
      ctx.fill();
      ctx.strokeStyle = pal.cardBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = pal.accentPrimary;
      ctx.font = `bold 26px ${fontBody}`;
      ctx.fillText(
        isFa ? '📜 روایت زندگی و کارنامه روزگار' : '📜 THE SAGA OF THEIR LIFE',
        540,
        cursorY + 46
      );

      ctx.fillStyle = pal.secondaryText;
      ctx.font = `28px ${fontBody}`;
      const bioLines = wrapCanvasParagraph(ctx, bio.narrative, 830).slice(0, 6);
      bioLines.forEach((ln, idx) => {
        ctx.fillText(ln, 540, cursorY + 98 + idx * 42);
      });
      cursorY += bioBoxHeight + 24;

      // 7. 6 Heroic Stat Medallions (3x2 Grid)
      const colW = 290;
      const rowH = 122;
      statsItems.forEach((st, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const bx = 84 + col * (colW + 21);
        const by = cursorY + row * (rowH + 16);

        drawRoundedRect(ctx, bx, by, colW, rowH, 18);
        ctx.fillStyle = pal.statBoxBg;
        ctx.fill();
        ctx.strokeStyle = pal.statBoxBorder;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = pal.mutedText;
        ctx.font = `bold 20px ${fontBody}`;
        ctx.fillText(st.label, bx + colW / 2, by + 34);

        ctx.fillStyle = pal.primaryText;
        ctx.font = `bold 34px ${fontBody}`;
        ctx.fillText(st.value, bx + colW / 2, by + 76);

        ctx.fillStyle = pal.accentPrimary;
        ctx.font = `600 19px ${fontBody}`;
        ctx.fillText(st.sub, bx + colW / 2, by + 105);
      });
      cursorY += rowH * 2 + 44;

      // 8. Philosophical Viking Epitaph Quote Box
      const quoteBoxH = 165;
      drawRoundedRect(ctx, 84, cursorY, 912, quoteBoxH, 22);
      ctx.fillStyle = pal.quoteBg;
      ctx.fill();
      ctx.strokeStyle = pal.quoteBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = pal.badgeText;
      ctx.font = `italic bold 26px ${fontMain}`;
      const quoteLines = wrapCanvasParagraph(ctx, activeQuote, 830).slice(0, 3);
      quoteLines.forEach((ln, i) => {
        ctx.fillText(ln, 540, cursorY + 52 + i * 40);
      });

      // 9. Footer Seal & Seed Watermark
      ctx.fillStyle = pal.mutedText;
      ctx.font = `bold 22px ${fontBody}`;
      ctx.fillText(
        isFa
          ? `حماسه‌ی تاج‌ها (Saga of Crowns)  ·  کد دنیا: ${state.seedString}  ·  ᛟ ᛏ ᛉ`
          : `SAGA OF CROWNS  ·  World Seed: ${state.seedString}  ·  ᛟ ᛏ ᛉ`,
        540,
        1848
      );

      canvas.toBlob(async (blob) => {
        setIsExporting(false);
        if (!blob) return;
        const fileName = `saga-of-crowns-${c.givenName.toLowerCase()}-${state.year}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (
          mode === 'share' &&
          typeof navigator !== 'undefined' &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            await navigator.share({
              title: `${fullName} — ${sagaTitle}`,
              text: `${fullName}: ${bio.narrative}`,
              files: [file],
            });
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 2600);
            return;
          } catch {
            // Fall through to direct download if user dismisses share dialog
          }
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2600);
      }, 'image/png');
    } catch {
      setIsExporting(false);
    }
  };

  const modalNode = (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[120] max-h-dvh overflow-hidden bg-surface-backdrop backdrop-blur-sm flex flex-col items-center justify-center p-2.5 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isFa ? 'پوستر داستان زندگی و اشتراک‌گذاری' : 'Shareable Character Saga Poster'}
    >
      {/* Hidden high-res SVG portrait used for crisp Canvas serialization */}
      <div ref={hiddenPortraitWrapRef} className="sr-only pointer-events-none" aria-hidden="true">
        <VikingPortrait
          age={c.age}
          sex={c.sex}
          traits={c.traits}
          title={c.title}
          appearance={c.appearance}
          seedId={c.id}
          size={320}
        />
      </div>

      <div
        ref={modalRef}
        className="w-full max-w-xl max-h-[94dvh] flex flex-col overflow-hidden rounded-2xl bg-surface-elevated border border-border-subtle shadow-[0_25px_70px_rgba(0,0,0,0.85)] text-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Studio Bar */}
        <div className="shrink-0 px-3.5 sm:px-4 py-2.5 border-b border-border-subtle bg-surface-secondary flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gold-500/15 border border-gold-500/40 text-accent-amber flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-saga text-sm sm:text-base font-bold text-ink-primary leading-snug">
                {isFa ? 'پوستر داستان زندگی (استوری ۹:۱۶)' : 'Character Saga Story Poster'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-ink-muted leading-snug">
                {isFa
                  ? 'چهره، زندگینامه و کارنامه افتخارات کاراکتر شما'
                  : 'High-resolution 9:16 portrait poster with biography & deeds'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isFa ? 'بستن' : 'Close'}
            className="w-8 h-8 rounded-xl bg-surface-interactive hover:bg-surface-interactive border border-border-subtle flex items-center justify-center text-ink-secondary cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customization Strip: Theme + Quote Switcher */}
        <div className="shrink-0 px-3.5 sm:px-4 py-2 bg-surface-card border-b border-border-subtle flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {(Object.values(POSTER_THEMES) as PosterPalette[]).map((t) => {
              const active = t.id === themeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-gold-500 text-nordic-950 border-gold-500'
                      : 'bg-surface-secondary text-ink-secondary border-border-subtle hover:border-gold-500/50'
                  }`}
                >
                  {isFa ? t.nameFa : t.nameEn}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setQuoteIdx((v) => v + 1)}
            className="px-2.5 py-1 rounded-lg bg-surface-secondary hover:bg-surface-interactive border border-border-subtle text-[11px] font-semibold text-accent-ice cursor-pointer whitespace-nowrap shrink-0"
          >
            {isFa ? '↻ سخن دیگر' : '↻ Quote'}
          </button>
        </div>

        {/* Complete Poster Live Preview (Compact proportions so the whole 9:16 card is visible) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2.5 sm:px-5 sm:py-3 flex flex-col items-center">
          <div
            style={{
              background: `linear-gradient(180deg, ${pal.bgTop} 0%, ${pal.bgMid} 52%, ${pal.bgBot} 100%)`,
              borderColor: pal.outerFrame,
              color: pal.primaryText,
            }}
            className="relative mx-auto w-full max-w-[360px] h-auto rounded-3xl border-2 p-3 sm:p-4 shadow-2xl flex flex-col items-center text-center space-y-2"
          >
            {/* Inner Ornamental Frame */}
            <div
              style={{ borderColor: pal.innerFrame }}
              className="pointer-events-none absolute inset-2 rounded-2xl border"
            />

            {/* Top Runic Kicker */}
            <div className="relative z-10 space-y-0.5">
              <div
                style={{ color: pal.accentPrimary }}
                className="text-[10px] font-mono tracking-widest font-bold"
              >
                ᛟ ᛋᚨᚷᚨ ᛟᚠ ᚲᚱᛟᚹᚾᛋ ᛟ
              </div>
              <div style={{ color: pal.mutedText }} className="text-[10px] font-semibold">
                {isFa
                  ? `طومار زندگینامه · ${formatDynastyName(state.dynastyName, 'fa')}`
                  : `CHRONICLE OF ${state.dynastyName.toUpperCase()}`}
              </div>
            </div>

            {/* Character Portrait Medallion */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                style={{
                  borderColor: pal.accentPrimary,
                  boxShadow: `0 0 22px ${pal.cardBorder}`,
                }}
                className="p-1 rounded-2xl border-2"
              >
                <VikingPortrait
                  age={c.age}
                  sex={c.sex}
                  traits={c.traits}
                  title={c.title}
                  appearance={c.appearance}
                  seedId={c.id}
                  size={68}
                />
              </div>

              {/* Rank & Status Pill Overlapping Bottom of Portrait */}
              <span
                style={{
                  backgroundColor: pal.accentPrimary,
                  color: '#0B1118',
                }}
                className="-mt-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-md inline-flex items-center gap-1"
              >
                {death ? <Skull className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                <span>
                  {SHORT_TITLE_LABELS[lang][c.title]} ·{' '}
                  {isFa ? `${c.age} سالگی` : `Age ${c.age}`}
                </span>
              </span>
            </div>

            {/* Name, Epithet & Saga Title */}
            <div className="relative z-10 space-y-1 w-full">
              <h2 className="font-saga text-base sm:text-lg font-bold leading-snug break-words">
                {fullName}
                {epText}
              </h2>

              <div
                style={{
                  backgroundColor: pal.badgeBg,
                  borderColor: pal.cardBorder,
                  color: pal.badgeText,
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl border text-[11px] font-bold"
              >
                <Crown className="w-3 h-3 shrink-0" />
                <span>{sagaTitle}</span>
              </div>

              {traitNames.length > 0 && (
                <div style={{ color: pal.mutedText }} className="text-[10px]">
                  {traitNames.join(' · ')}
                </div>
              )}
            </div>

            {/* Meaningful Biographical Story Narrative */}
            <div
              style={{
                backgroundColor: pal.cardBg,
                borderColor: pal.cardBorder,
              }}
              className="relative z-10 w-full p-2.5 rounded-2xl border text-start space-y-1.5"
            >
              <div
                style={{ color: pal.accentPrimary }}
                className="text-[11px] font-bold flex items-center gap-1"
              >
                <Flame className="w-3 h-3 shrink-0" />
                <span>{isFa ? 'روایت زندگی و کارنامه روزگار' : 'Life Saga & Deeds'}</span>
              </div>
              <p
                style={{ color: pal.secondaryText }}
                className="text-[11px] leading-relaxed whitespace-normal break-words"
              >
                {bio.narrative}
              </p>

              {/* Notable Life Highlights */}
              {bio.highlights.length > 0 && (
                <div
                  style={{ borderColor: pal.statBoxBorder }}
                  className="pt-1.5 border-t space-y-0.5"
                >
                  <div style={{ color: pal.mutedText }} className="text-[10px] font-bold">
                    {isFa ? 'مهم‌ترین نقاط عطف زندگی:' : 'Defining Moments:'}
                  </div>
                  {bio.highlights.slice(0, 3).map((h, i) => (
                    <div
                      key={i}
                      style={{ color: pal.secondaryText }}
                      className="text-[10px] flex items-start gap-1"
                    >
                      <span style={{ color: pal.accentPrimary }} className="font-mono font-bold shrink-0">
                        {isFa ? `سن ${h.age}:` : `Age ${h.age}:`}
                      </span>
                      <span className="break-words">{h.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 6 Heroic Metrics Grid */}
            <div className="relative z-10 w-full grid grid-cols-3 gap-1.5">
              {statsItems.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: pal.statBoxBg,
                    borderColor: pal.statBoxBorder,
                  }}
                  className="p-1.5 rounded-xl border flex flex-col items-center justify-center text-center"
                >
                  <span style={{ color: pal.mutedText }} className="text-[9px] font-semibold">
                    {st.label}
                  </span>
                  <span
                    style={{ color: pal.primaryText }}
                    className="text-xs font-mono font-bold tabular-nums"
                  >
                    {st.value}
                  </span>
                  <span style={{ color: pal.accentPrimary }} className="text-[9px] font-medium">
                    {st.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* Philosophical Viking Quote */}
            <div
              style={{
                backgroundColor: pal.quoteBg,
                borderColor: pal.quoteBorder,
                color: pal.badgeText,
              }}
              className="relative z-10 w-full p-2 rounded-xl border text-[11px] italic font-medium leading-snug"
            >
              {activeQuote}
            </div>

            {/* Bottom Runic Seal */}
            <div
              style={{ color: pal.mutedText }}
              className="relative z-10 text-[9px] font-mono pt-0.5 flex items-center justify-between w-full px-1"
            >
              <span>Saga of Crowns · {state.year} AD</span>
              <span>Seed: {state.seedString}</span>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer: Download HD Story PNG + Share */}
        <div className="shrink-0 px-4 py-2.5 border-t border-border-subtle bg-surface-secondary flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExportPoster('download')}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-nordic-950 font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            {savedNotice ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>
                  {isFa ? 'پوستر باکیفیت ذخیره شد!' : 'HD Story Poster Saved!'}
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>
                  {isFa
                    ? 'دانلود عکس استوری (کیفیت بالا)'
                    : 'Download HD Story Image'}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExportPoster('share')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-ice-tint hover:bg-surface-ice-hover border border-status-ice/50 text-xs sm:text-sm font-bold text-accent-ice inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>{isFa ? 'اشتراک‌گذاری' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }
  return modalNode;
}
