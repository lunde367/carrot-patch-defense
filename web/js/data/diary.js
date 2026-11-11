// The garden diary: the only place the story speaks in words. A page shows when a garden
// starts or is finished for the first time; every page read is kept on the Diary screen.
// Key = `${when}-${chapter id}`. Tone runs cheerful → worried → quiet → hopeful (see the story plan).
export const DIARY = [
  { key:'after-cabbage',    title:'After the Cabbage Patch', text:'Best cabbages on the street this year! The bunnies were heroes. Can’t wait for strawberry season.' },
  { key:'start-strawberry', title:'Strawberry season',       text:'The garden center gave me a free sprayer. “Works like magic,” the man said. We’ll see!' },
  { key:'after-strawberry', title:'After the Strawberry Bed', text:'It really does work like magic. One spray and the caterpillars are gone. Hardly needed the bunnies.' },
  { key:'after-carrot',     title:'After the Carrot Rows',   text:'Summer just won’t end. The carrots are fine, but the creek behind the fence is lower than I’ve ever seen it.' },
  { key:'start-tomato',     title:'The greenhouse',          text:'Third heat wave this month. It’s too hot outside, so the tomatoes went in the old greenhouse. And the sprayer doesn’t work like it used to.' },
  { key:'after-tomato',     title:'After the Tomato Greenhouse', text:'The tomatoes cracked in the heat, and the stink bugs just shrugged off the spray. The store says I need a stronger formula.' },
  { key:'start-apple',      title:'The orchard',             text:'The apple trees bloomed all at once. So pretty. But I stood under them for an hour and didn’t hear a single bee.' },
  { key:'after-apple',      title:'After the Apple Orchard', text:'The apples came in small and few. Without the bees, the blossoms just fell. The aphids didn’t mind.' },
  { key:'start-corn',       title:'The corn field',          text:'No rain since spring. The ground has cracked open like an old plate. I’m saving every drop for the sprinklers.' },
  { key:'after-corn',       title:'After the Corn Field',    text:'The spray barely slows them now. Every year the bugs come back tougher, and every year we spray more. Something has to change.' },
];
export const diaryEntry = key => DIARY.find(d => d.key === key);
