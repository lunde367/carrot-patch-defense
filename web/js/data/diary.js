// The garden diary: the only place the story speaks in words. A page shows when a garden
// starts or is finished for the first time; every page read is kept on the Diary screen.
// Key = `${when}-${chapter id}`. Tone runs cheerful → worried → quiet → hopeful (see the story plan).
export const DIARY = [
  { key:'start-cabbage',    title:'My garden',               text:'Grandpa gave me the back corner of the yard and a packet of cabbage seeds. The slugs have found them already. Time to call in the bunnies.' },
  { key:'after-cabbage',    title:'After the Cabbage Patch', text:'Best cabbages on the street this year! The bunnies were heroes. Can’t wait for strawberry season.' },
  { key:'start-strawberry', title:'Strawberry season',       text:'The garden center gave me a free sprayer. “Works like magic,” the man said. We’ll see!' },
  { key:'after-strawberry', title:'After the Strawberry Bed', text:'It really does work like magic. One spray and the caterpillars are gone. Hardly needed the bunnies.' },
  { key:'after-carrot',     title:'After the Carrot Rows',   text:'Summer just won’t end. The carrots are fine, but the creek behind the fence is lower than I’ve ever seen it.' },
  { key:'start-tomato',     title:'The greenhouse',          text:'Third heat wave this month. It’s too hot outside, so the tomatoes went in the old greenhouse. And the sprayer doesn’t work like it used to.' },
  { key:'after-tomato',     title:'After the Tomato Greenhouse', text:'The tomatoes cracked in the heat, and the stink bugs just shrugged off the spray. The store says I need a stronger formula.' },
  { key:'start-apple',      title:'The orchard',             text:'The apple trees bloomed all at once. So pretty. But I stood under them for an hour and didn’t hear a single bee.' },
  { key:'start-apple-2',    title:'New neighbors',           text:'The Hendersons got back from their big trip with a potted plant from overseas. Now there are shiny green beetles on every apple tree. Nobody on our street has ever seen them before.' },
  { key:'after-apple',      title:'After the Apple Orchard', text:'The apples came in small and few. Without the bees, the blossoms just fell. The aphids didn’t mind.' },
  { key:'start-corn',       title:'The corn field',          text:'No rain since spring. The ground has cracked open like an old plate. I’m saving every drop for the sprinklers.' },
  { key:'after-corn',       title:'After the Corn Field',    text:'The spray barely slows them now. Every year the bugs come back tougher, and every year we spray more. Something has to change.' },
  { key:'start-dust',       title:'The dust bowl',           text:'I came out to help on my uncle’s wheat farm. The wind took the topsoil here. We’re saving water in barrels. I haven’t heard a bird in weeks.' },
  { key:'start-dust-2',     title:'Grandpa',                 text:'Grandpa’s been sick a long time now. He used to tell me the spray was safe. I keep wondering if he was right.' },
  { key:'after-dust',       title:'After the Dust Bowl',     text:'We saved some wheat. Not much. The city folks say there’s a garden on a rooftop downtown. I’m going to see.' },
  { key:'start-rooftop',    title:'The rooftop',             text:'You can’t see the sun through the smog. Up here, between the chimneys, a few peppers are still growing.' },
  { key:'after-rooftop',    title:'After the Rooftop Garden', text:'The peppers made it. The woman who keeps the rooftop told me about a vault in the hills, where people once stored seeds from every garden. She drew me a map.' },
  { key:'start-vault',      title:'The seed vault',          text:'This is the last seed vault. Somebody packed these seeds years ago, back when there were gardens everywhere.' },
  { key:'after-vault',      title:'After the Last Seed Vault', text:'I saved the seeds. And I’m done spraying. It never fixed anything; the bugs just came back tougher. This time I’m planting the vault seeds instead: clover, wildflowers, and trees along the creek.' },
  { key:'start-rain',       title:'Rain',                    text:'Three years of planting. The roots hold the ground now, and the saplings along the creek are taller than I am. This morning, for the first time in a long time, it rained.' },
  { key:'after-rain',       title:'After the Rain Garden',   text:'The creek is running again. The frogs are singing at night. I’d forgotten how loud a healthy garden is.' },
  { key:'start-meadow',     title:'The meadow',              text:'The clover brought the bees, and the bees brought the flowers. The rooftop gardeners came out to help, and now half the street is planting. The meadow is coming back because we gave it room.' },
  { key:'after-meadow',     title:'After the Wildflower Meadow', text:'Grandpa sat in the meadow today and counted bees. He got to eleven before he fell asleep in the sun.' },
  { key:'start-newgarden',  title:'The new garden',          text:'Today we planted the last of the vault seeds. Pumpkins, beans, flowers. A garden that works with nature, not against it.' },
  { key:'after-newgarden',  title:'After The New Garden',    text:'Bees on the clover, frogs in the pond, the creek running again. We didn’t fight nature this time. We gave it room.' },
];
export const diaryEntry = key => DIARY.find(d => d.key === key);
