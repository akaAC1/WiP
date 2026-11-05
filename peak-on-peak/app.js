"use strict";
// ---------- program ----------
const TYPES={plyo:["Plyometrics","--t-plyo"],oiso:["Overcoming isometric","--t-iso"],yiso:["Yielding isometric","--t-iso"],power:["Power","--t-power"],str:["Strength + contrast","--t-str"],hyp:["Hypertrophy","--t-hyp"],core:["Core","--t-core"],mob:["Mobility","--t-mob"],
  sa:["Block A","--t-str"],sb:["Block B","--t-hyp"],sc:["Block C","--t-power"],sd:["Block D","--t-iso"],fin:["Finisher","--t-core"],run:["Main set","--t-str"],cool:["Cool-down","--t-hyp"]};
// w: true = log a load for this exercise
const X=(l,n,s,r,rest,sec,note,w=true)=>({l,n,s,r,rest,sec,note,w});
// running: sets and prescription by week, ordered [W1, W2, W3, Deload, Peak]
const R=(n,sw,rw,rest,sec,note)=>({l:"",n,s:sw[0],sw,rw,r:rw[0],rest,sec,note,w:false});
const FIVE=["5 min","5 min","5 min","5 min","5 min"],ONE=[1,1,1,1,1];
const DAYS_OLD={
 mon:{short:"Mon",tag:"Run",dow:1,color:"--t-mob",cardio:true,title:"Long Easy Run",sub:"Zone 2 only. It should leave you fresher for Tuesday's jumps and squats.",warm:"5 min brisk walk, then leg swings ×10/side and ankle hops ×20.",
  wk:["20 minutes, fully conversational.","25 minutes, same easy pace.","30 minutes. Pace stays easy even if it feels slow.","Short and easy: 20 minutes, or a brisk walk if your legs are heavy.","Longest run of the month, 35–40 minutes, still easy. The hard work this week is Wednesday and Friday."],
  blocks:[
   ["run",[R("Easy continuous run",ONE,["20 min","25 min","30 min","20 min","35–40 min"],"",0,"Nose-breathing pace, about 60–70% of max HR. Flat route; save hills for Friday.")]],
   ["mob",[X("","Calf stretch (wall)",2,"45 s/side","",0,"",false),X("","Half-kneeling hip flexor stretch",2,"45 s/side","",0,"Squeeze the back glute",false)]]
  ]},
 tue:{short:"Tue",tag:"Lower",dow:2,color:"--t-plyo",title:"Lower Push/Pull",sub:"Squat pattern pushes, hinge pattern pulls.",warm:"5 min bike or row, then 1 round: goblet squat ×8, banded glute bridge ×12, leg swings ×10/side, bodyweight RDL ×8.",
  blocks:[
   ["plyo",[X("A1","Box jump (step down)",4,"3","60 s",60,"Land soft and quiet; reset each rep",false),X("A2","Broad jump",4,"3","60 s",60,"Stick the landing 2 s",false)]],
   ["oiso",[X("","Pin squat push, bar at ~parallel",3,"6 s","90 s",90,"Build to max effort over 1–2 s, then hold",false),X("","Pin RDL pull, bar just below knee",3,"6 s","90 s",90,"Brace, pull the bar through the pins",false)]],
   ["yiso",[X("A1","DB split-squat hold (bottom)",2,"30 s/side","30 s",30,"Back knee 1 inch off the floor"),X("A2","DB RDL hold (mid-shin)",2,"30 s","60 s",60,"Flat back, hamstrings loaded")]],
   ["power",[X("A1","Barbell jump squat (20–30% of squat)",4,"3","60 s",60,"Max height every rep"),X("A2","Hang power clean or DB snatch",4,"3","90 s",90,"Bar speed is the goal")]],
   ["str",[X("A1","Back squat",4,"4–5","2 min",120,"RPE 7–8"),X("A2","Conventional or trap-bar deadlift",3,"3–5","2–3 min",150,"RPE 7–8")]],
   ["hyp",[X("A1","DB Bulgarian split squat",3,"8–10/side","60 s",60,"3 s lowering"),X("A2","Barbell hip thrust",3,"10–12","60 s",60,"1 s squeeze at top"),X("B","DB single-leg RDL",2,"10/side","60 s",60,"Hips square")]],
   ["core",[X("A1","Barbell rollout (or ab wheel)",3,"8","45 s",45,"Anti-extension. Ribs down, no low-back sag",false),X("A2","Dead bug, DB held overhead",3,"8/side","45 s",45,"Low back pinned to floor")]],
   ["mob",[X("","90/90 hip switches",2,"8/side","",0,"Slow, tall torso",false),X("","Knee-to-wall ankle mobilization",2,"10/side","",0,"Heel stays down",false),X("","Couch stretch",2,"45 s/side","",0,"Squeeze glute of back leg",false)]]
  ]},
 wed:{short:"Wed",tag:"Sprint",dow:3,color:"--t-core",cardio:true,title:"100 m Sprints",sub:"Fast and fully rested between reps. 24 h after Tuesday's legs, 72 h before Saturday's.",warm:"5 min easy jog, then A-skips, B-skips, high knees and butt kicks (2 × 20 m each), then 3 build-ups over 60 m to about 80%.",
  wk:["6 reps at about 85%. Learn the rhythm.","8 reps at 85–90%.","8 reps at 90–95%.","4 relaxed strides at about 80%.","6 reps at 95%+ with a full 4 minutes between reps. Quality over count."],
  blocks:[
   ["run",[R("100 m sprint",[6,8,8,4,6],["100 m @ 85%","100 m @ 85–90%","100 m @ 90–95%","100 m stride @ 80%","100 m @ 95%+"],"walk back + 2 min",180,"Run tall, loose jaw and hands. End the set when a rep feels slower. Hamstrings still sore from Tuesday? Run strides at 80% only.")]],
   ["cool",[R("Easy jog, then walk",ONE,FIVE,"",0,"")]],
   ["mob",[X("","Lying hamstring floss (strap)",2,"10/side","",0,"Gentle; no hard stretching right after sprints",false),X("","Couch stretch",2,"45 s/side","",0,"",false)]]
  ]},
 thu:{short:"Thu",tag:"Upper",dow:4,color:"--t-hyp",title:"Upper Push/Pull",sub:"Every press is paired with a pull.",warm:"5 min row, then band pull-aparts ×15, scap push-ups ×10, DB external rotation ×12/side, light DB press ×10.",
  blocks:[
   ["plyo",[X("A1","Plyo push-up (hands leave floor)",4,"4","45 s",45,"Hands-on-bench version if needed",false),X("A2","Explosive inverted row (barbell in rack)",4,"5","60 s",60,"Pull chest to bar as fast as possible, lower under control. Advanced: let hands briefly leave the bar at the top",false)]],
   ["oiso",[X("","Pin bench press, bar 2–3 in. off chest",3,"6 s","90 s",90,"Press into the pins at full effort",false),X("","Pin row, bar on pins",3,"6 s","90 s",90,"Drive elbows back, hold",false)]],
   ["yiso",[X("A1","DB bench hold, 90° elbow",2,"30 s","30 s",30,"Don't let the DBs drift"),X("A2","Flexed-arm hang or chest-supported row hold",2,"20–30 s","60 s",60,"Shoulder blades pinned back")]],
   ["power",[X("A1","Barbell push press",4,"3","60 s",60,"Dip and drive, fast lockout"),X("A2","Explosive DB row",4,"4/side","90 s",90,"Fast up, controlled down")]],
   ["str",[X("A1","Barbell bench press",4,"4–5","2 min",120,"RPE 7–8"),X("A2","Weighted pull-up or Pendlay row",4,"4–6","2 min",120,"RPE 7–8")]],
   ["hyp",[X("A1","Incline DB press",3,"8–12","60 s",60,"3 s lowering"),X("A2","Single-arm DB row",3,"10–12/side","60 s",60,"Pause at top"),X("B1","Seated DB overhead press",2,"10–12","45 s",45,""),X("B2","DB rear-delt fly + hammer curl",2,"12 each","60 s",60,"")]],
   ["core",[X("A1","Light good morning or back-extension hold",3,"10 / 30 s","45 s",45,"Anti-flexion. Long spine, no rounding"),X("A2","DB front-rack march",3,"30 s","45 s",45,"Tall chest, elbows high")]],
   ["mob",[X("","Thoracic open book",2,"8/side","",0,"Exhale into the rotation",false),X("","Shoulder dislocates (bar or dowel)",2,"10","",0,"Widen grip if shoulders pinch",false),X("","Wrist rocks + prayer stretches",2,"30 s each","",0,"Pressing-day essential",false)]]
  ]},
 fri:{short:"Fri",tag:"4×4",dow:5,color:"--t-iso",cardio:true,title:"Norwegian 4×4",sub:"Hard aerobic intervals. Hills or an incline spare your legs for Saturday.",warm:"10 min easy jog building to a moderate pace, then 2 × 20 s pickups.",
  wk:["3 intervals at 85–90% of max HR.","4 intervals at 85–95% of max HR.","4 intervals at 90–95%. Try to cover more ground than week 2.","2 intervals at about 85%. Finish feeling good.","4 intervals at 90–95%. Aim for your best distance of the month."],
  blocks:[
   ["run",[R("4-minute interval",[3,4,4,2,4],["4 min @ 85–90% HR","4 min @ 85–95% HR","4 min @ 90–95% HR","4 min @ ~85% HR","4 min @ 90–95% HR"],"3 min easy jog",180,"Hard but steady: you can say only a few words. A hill or a 6–10% treadmill incline cuts the pounding before Saturday.")]],
   ["cool",[R("Easy jog, then walk",ONE,FIVE,"",0,"")]],
   ["mob",[X("","Calf stretch (wall)",2,"45 s/side","",0,"",false),X("","90/90 hip switches",2,"8/side","",0,"",false)]]
  ]},
 sat:{short:"Sat",tag:"Odd lifts",dow:6,color:"--t-power",title:"Total Body, Odd Lifts",sub:"Start each new lift light and own the shape first.",warm:"5 min easy cardio, then Turkish get-up ×2/side (light DB), Cossack squat ×6/side, bodyweight Jefferson curl ×5 (slow).",
  blocks:[
   ["sa",[X("A1","Zercher squat",4,"5–6","90 s",90,"Bar in elbow crooks; pad it. Builds upper back and brace"),X("A2","Z press (seated on floor)",4,"6–8","90 s",90,"No leg drive; exposes core and shoulder mobility")]],
   ["sb",[X("B1","Barbell hack squat (bar behind legs)",3,"8","75 s",75,"Heels on plates, torso upright"),X("B2","Meadows row",3,"8–10/side","75 s",75,"Staggered stance, overhand grip on sleeve")]],
   ["sc",[X("C1","Jefferson deadlift (straddle)",4,"6","90 s",90,"Alternate front foot each set: 2 sets per side"),X("C2","DB pullover",3,"10–12","60 s",60,"Slight elbow bend, deep lat stretch, ribs down")]],
   ["sd",[X("D1","Jefferson curl",3,"6","60 s",60,"Light. Roll down one vertebra at a time, 4 s down"),X("D2","JM press",3,"8–10","60 s",60,"Close-grip bench meets skull crusher"),X("D3","Cuban press (DBs)",3,"10","60 s",60,"Very light; cuff and lower traps")]],
   ["fin",[X("","Suitcase march in place",3,"30–40 s/side","45 s",45,"One heavy DB, slow high knees, don't lean"),X("","Zercher hold",3,"30–40 s","90 s",90,"Stand tall, bar in elbows")]],
   ["mob",[X("","Cossack squat + pancake stretch",2,"6/side, 60 s","",0,"Adductors and hamstrings",false),X("","Bench lat stretch",2,"45 s","",0,"Pairs with the pullover work",false)]]
  ],
  extra:`<h3>Swap options</h3><ul><li>Sots press for Z press</li><li>Bradford press for JM press</li><li>Anderson squat (from pins) for hack squat</li><li>Pendlay-to-gorilla row for Meadows row</li><li>Turkish get-up, 3/side, instead of the finisher</li></ul><h3>Jefferson curl safety</h3><p>Treat it as loaded mobility. Progress range and control first, keep load under about 10–20% of bodyweight for the first months, and skip it any day your back feels off.</p>`}
};
// C = contrast or filler set inside the strength block (never split into top/back-off)
const C=(...a)=>({...X(...a),c:true});
// Program as of PROGRAM_SWITCH: contrast-set strength blocks, readiness check-in.
// Earlier dates keep DAYS_OLD so past logs show what was actually trained.
const PROGRAM_SWITCH="2026-11-06";
const DAYS={
 mon:{short:"Mon",tag:"Run",dow:1,color:"--t-mob",cardio:true,title:"Long Easy Run",sub:"Zone 2 only. It should leave you fresher for Tuesday's jumps and squats.",warm:"5 min brisk walk, then leg swings ×10/side and ankle hops ×20.",
  wk:["20 minutes, fully conversational.","25 minutes, same easy pace.","30 minutes. Pace stays easy even if it feels slow.","Short and easy: 20 minutes, or a brisk walk if your legs are heavy.","Longest run of the month, 35–40 minutes, still easy. The hard work this week is Wednesday and Friday."],
  blocks:[
   ["run",[R("Easy continuous run",ONE,["20 min","25 min","30 min","20 min","35–40 min"],"",0,"Nose-breathing pace, about 60–70% of max HR. Flat route; save hills for Friday.")]],
   ["mob",[X("","Calf stretch (wall)",2,"45 s/side","",0,"",false),X("","Half-kneeling hip flexor stretch",2,"45 s/side","",0,"Squeeze the back glute",false)]]
  ]},
 tue:{short:"Tue",tag:"Lower",dow:2,color:"--t-plyo",title:"Lower Push/Pull",sub:"Squat pattern pushes, hinge pattern pulls. About 55 minutes.",warm:"5 min bike or row, then leg swings ×10/side, goblet squat ×8, glute bridge ×10.",
  blocks:[
   ["plyo",[X("","Box jump (step down)",3,"3","45 s",45,"Land soft and quiet; reset each rep",false)]],
   ["oiso",[X("A1","Pin squat push, bar at ~parallel",3,"6 s","15 s",15,"Build to max effort over 1–2 s, then hold. Same pins as A2",false),X("A2","Pin RDL pull, bar just below knee",3,"6 s","45 s",45,"Brace, pull the bar through the pins",false)]],
   ["yiso",[X("A1","DB split-squat hold (bottom)",2,"30 s/side","none",0,"Back knee 1 inch off the floor. Go straight into A2"),X("A2","DB RDL hold (mid-shin)",2,"30 s","45 s",45,"Flat back, hamstrings loaded")]],
   ["str",[X("A1","Back squat",4,"4–5","20 s",20,"RPE 7–8. 20 s later, do A2"),C("A2","Barbell jump squat (20–30% of squat)",4,"3","2 min",120,"Contrast set: max height every rep"),C("A3","Barbell rollout (or ab wheel)",4,"8","",0,"Filler: do it early in the 2-min rest. Ribs down, no low-back sag",false),
            X("B1","Conventional or trap-bar deadlift",3,"3–5","20 s",20,"RPE 7–8. 20 s later, do B2"),C("B2","Broad jump",3,"3","2–3 min",150,"Contrast set: stick each landing 2 s",false),C("B3","Dead bug, DB held overhead",3,"8/side","",0,"Filler: do it early in the rest. Low back pinned to floor")]],
   ["hyp",[X("A1","DB Bulgarian split squat",3,"8–10/side","30 s",30,"3 s lowering"),X("A2","Barbell hip thrust",3,"10–12","45 s",45,"1 s squeeze at top")]],
   ["mob",[X("","90/90 hip switches",2,"8/side","",0,"Slow, tall torso",false),X("","Knee-to-wall ankle mobilization",2,"10/side","",0,"Heel stays down. Couch stretch now lives on Wednesday",false)]]
  ]},
 wed:{short:"Wed",tag:"Sprint",dow:3,color:"--t-core",cardio:true,title:"100 m Sprints",sub:"Fast and fully rested between reps. 24 h after Tuesday's legs, 72 h before Saturday's.",warm:"5 min easy jog, then A-skips, B-skips, high knees and butt kicks (2 × 20 m each), then 3 build-ups over 60 m to about 80%.",
  wk:["6 reps at about 85%. Learn the rhythm.","8 reps at 85–90%.","8 reps at 90–95%.","4 relaxed strides at about 80%.","6 reps at 95%+ with a full 4 minutes between reps. Quality over count."],
  blocks:[
   ["run",[R("100 m sprint",[6,8,8,4,6],["100 m @ 85%","100 m @ 85–90%","100 m @ 90–95%","100 m stride @ 80%","100 m @ 95%+"],"walk back + 2 min",180,"Run tall, loose jaw and hands. End the set when a rep feels slower. Hamstrings still sore from Tuesday? Run strides at 80% only.")]],
   ["cool",[R("Easy jog, then walk",ONE,FIVE,"",0,"")]],
   ["mob",[X("","Lying hamstring floss (strap)",2,"10/side","",0,"Gentle; no hard stretching right after sprints",false),X("","Couch stretch",2,"45 s/side","",0,"",false)]]
  ]},
 thu:{short:"Thu",tag:"Upper",dow:4,color:"--t-hyp",title:"Upper Push/Pull",sub:"Every press is paired with a pull. About 55 minutes.",warm:"5 min row, then band pull-aparts ×15, scap push-ups ×10, DB external rotation ×12/side.",
  blocks:[
   ["power",[X("","Barbell push press",3,"3","60 s",60,"Dip and drive, fast lockout. Doubles as your pressing warm-up")]],
   ["oiso",[X("A1","Pin bench press, bar 2–3 in. off chest",3,"6 s","15 s",15,"Press into the pins at full effort. Same rack as A2",false),X("A2","Pin row, bar on pins",3,"6 s","45 s",45,"Drive elbows back, hold",false)]],
   ["yiso",[X("A1","DB bench hold, 90° elbow",2,"30 s","none",0,"Don't let the DBs drift. Go straight into A2"),X("A2","Flexed-arm hang or chest-supported row hold",2,"20–30 s","45 s",45,"Shoulder blades pinned back")]],
   ["str",[X("A1","Barbell bench press",4,"4–5","20 s",20,"RPE 7–8. 20 s later, do A2"),C("A2","Plyo push-up (hands leave floor)",4,"4","2 min",120,"Contrast set: explode off the floor",false),C("A3","DB front-rack march",4,"30 s","",0,"Filler: do it early in the 2-min rest. Tall chest, elbows high"),
            X("B1","Weighted pull-up or Pendlay row",4,"4–6","20 s",20,"RPE 7–8. 20 s later, do B2"),C("B2","Explosive inverted row (barbell in rack)",4,"5","2 min",120,"Contrast set: chest to bar fast, lower under control",false),C("B3","Back-extension hold or light good morning",3,"30 s / 10","",0,"Filler, anti-flexion. Long spine, no rounding")]],
   ["hyp",[X("A1","Incline DB press",3,"8–12","30 s",30,"3 s lowering"),X("A2","Single-arm DB row",3,"10–12/side","30 s",30,"Pause at top"),X("A3","Seated DB overhead press",2,"10–12","45 s",45,"Tri-set: A1 → A2 → A3, then rest")]],
   ["mob",[X("","Thoracic open book",2,"8/side","",0,"Exhale into the rotation",false),X("","Wrist rocks + prayer stretches",2,"30 s each","",0,"Shoulder dislocates now live on Friday",false)]]
  ]},
 fri:{short:"Fri",tag:"4×4",dow:5,color:"--t-iso",cardio:true,title:"Norwegian 4×4",sub:"Hard aerobic intervals. Hills or an incline spare your legs for Saturday.",warm:"10 min easy jog building to a moderate pace, then 2 × 20 s pickups.",
  wk:["3 intervals at 85–90% of max HR.","4 intervals at 85–95% of max HR.","4 intervals at 90–95%. Try to cover more ground than week 2.","2 intervals at about 85%. Finish feeling good.","4 intervals at 90–95%. Aim for your best distance of the month."],
  blocks:[
   ["run",[R("4-minute interval",[3,4,4,2,4],["4 min @ 85–90% HR","4 min @ 85–95% HR","4 min @ 90–95% HR","4 min @ ~85% HR","4 min @ 90–95% HR"],"3 min easy jog",180,"Hard but steady: you can say only a few words. A hill or a 6–10% treadmill incline cuts the pounding before Saturday.")]],
   ["cool",[R("Easy jog, then walk",ONE,FIVE,"",0,"")]],
   ["mob",[X("","Calf stretch (wall)",2,"45 s/side","",0,"",false),X("","90/90 hip switches",2,"8/side","",0,"",false),X("","Shoulder dislocates (bar or dowel)",2,"10","",0,"Moved from Thursday. Widen grip if shoulders pinch",false)]]
  ]},
 sat:{short:"Sat",tag:"Odd lifts",dow:6,color:"--t-power",title:"Total Body, Odd Lifts",sub:"Start each new lift light and own the shape first.",warm:"5 min easy cardio, then Turkish get-up ×2/side (light DB), Cossack squat ×6/side, Cuban press ×10 (very light), bodyweight Jefferson curl ×5 (slow).",
  blocks:[
   ["sa",[X("A1","Zercher squat",4,"5–6","90 s",90,"Bar in elbow crooks; pad it. Builds upper back and brace"),X("A2","Z press (seated on floor)",4,"6–8","90 s",90,"No leg drive; exposes core and shoulder mobility")]],
   ["sb",[{...X("B1","Barbell hack squat (bar behind legs)",3,"8","75 s",75,"Heels on plates, torso upright. 2 sets in weeks 1–2"),sw:[2,2,3,2,3]},X("B2","Meadows row",3,"8–10/side","75 s",75,"Staggered stance, overhand grip on sleeve")]],
   ["sc",[X("C1","Jefferson deadlift (straddle)",4,"6","90 s",90,"Alternate front foot each set: 2 sets per side"),X("C2","DB pullover",3,"10–12","60 s",60,"Slight elbow bend, deep lat stretch, ribs down")]],
   ["sd",[X("D1","Jefferson curl",3,"6","60 s",60,"Light. Roll down one vertebra at a time, 4 s down"),X("D2","JM press",3,"8–10","60 s",60,"Close-grip bench meets skull crusher")]],
   ["fin",[X("","Suitcase march in place",2,"30–40 s/side","45 s",45,"One heavy DB, slow high knees, don't lean"),X("","Zercher hold",2,"30–40 s","90 s",90,"Stand tall, bar in elbows")]],
   ["mob",[X("","Cossack squat + pancake stretch",2,"6/side, 60 s","",0,"Adductors and hamstrings",false),X("","Bench lat stretch",2,"45 s","",0,"Pairs with the pullover work",false)]]
  ],
  extra:`<h3>Swap options</h3><ul><li>Sots press for Z press</li><li>Bradford press for JM press</li><li>Anderson squat (from pins) for hack squat</li><li>Pendlay-to-gorilla row for Meadows row</li><li>Turkish get-up, 3/side, instead of the finisher</li></ul><h3>Jefferson curl safety</h3><p>Treat it as loaded mobility. Progress range and control first, keep load under about 10–20% of bodyweight for the first months, and skip it any day your back feels off.</p>`}
};
const progFor=d=>d>=PROGRAM_SWITCH?DAYS:DAYS_OLD;
const TYPES_OLD={...TYPES,str:["Strength","--t-str"]};
const WEEKS=[
 ["Week 1","Sets as written. Strength at RPE 7; hypertrophy at the low end of each rep range."],
 ["Week 2","Strength +5–10 lb at RPE 7.5. Hypertrophy +1–2 reps per set. Yielding holds +5 s."],
 ["Week 3","Strength +5–10 lb again at RPE 8. Hypertrophy at the top of the range. Holds +5 s again; overcoming 4 sets; plyo and power +1 set."],
 ["Deload","Last week of the month. About half the volume: strength at RPE 6, isometrics at ~70% effort, plyo and power crisp. Sets are trimmed below."],
 ["Peak week","Fifth week of the month. Week 3 sets, but work up to one heavy top set on each strength lift (RPE 8.5–9, 2–3 reps), then 2 back-off sets at 90%. Log the top set: it sets next month's loads."]
];
function setsFor(base,type,w){
  if(w===2||w===4){ if(type==="plyo"||type==="power") return base+1; if(type==="oiso") return 4; }
  if(w===3) return Math.min(base,2);
  return base;
}
// ---------- dates (local) ----------
const pad=n=>String(n).padStart(2,"0");
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
let TODAY=iso(new Date());
const MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const sessionForDow=d=>[null,"mon","tue","wed","thu","fri","sat"][d];
function mondayOf(s){const d=parse(s);const k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return iso(d)}
// Month-aligned waves: a Mon–Sun week belongs to the month holding its Thursday.
// 4-week month: W1, W2, W3, Deload. 5-week month: W1, W2, W3, Peak, Deload.
function progWeek(s){
  const thu=parse(addDays(mondayOf(s),3)),y=thu.getFullYear(),m=thu.getMonth();
  const firstThu=1+(4-new Date(y,m,1).getDay()+7)%7,len=new Date(y,m+1,0).getDate();
  const n=Math.floor((len-firstThu)/7)+1,i=(thu.getDate()-firstThu)/7;
  const w=i===n-1?3:(n===5&&i===3?4:i);
  return {w,i,n,mon:MON[m]};
}
// ---------- state (saved on this device) ----------
const LS="peak-on-peak-v1";
let settings={start:mondayOf(TODAY)};
let days={};               // date -> {session, sets:{name:[0/1]}, wt:{name:lb}, bw}
let view={tab:"train", date:TODAY, year:+TODAY.slice(0,4)};
let saveState="ok";        // "ok" | "error"
function load(){
  try{const c=JSON.parse(localStorage.getItem(LS)||"null");if(c){if(c.settings)settings={...settings,...c.settings};if(c.days)days=c.days}}catch(e){}
}
let saveTimer=null;
function save(){
  try{localStorage.setItem(LS,JSON.stringify({settings,days}));saveState="ok"}catch(e){saveState="error"}
}
function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{save();paintSync()},250)}
function flushSave(){if(saveTimer){clearTimeout(saveTimer);saveTimer=null;save()}}
addEventListener("pagehide",flushSave);
document.addEventListener("visibilitychange",()=>{if(document.hidden)flushSave();else checkDayRollover()});
addEventListener("pageshow",()=>checkDayRollover());
addEventListener("focus",()=>checkDayRollover());
load();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
// The app can stay open (or suspended) overnight, and iOS doesn't reliably say when it
// comes back. syncToday() re-reads the clock before every tap without moving the page,
// so Today, the "today" label and Prev/Next always work from the real date.
function syncToday(){const now=iso(new Date());if(now===TODAY)return false;TODAY=now;return true}
// On reopening: if you were looking at the old "today", follow it to the new one.
function checkDayRollover(){
  const old=TODAY;if(!syncToday())return;
  if(view.date===old)view.date=TODAY;
  safeRender();
}
// While the app sits open across midnight, keep the label right without moving the page.
setInterval(()=>{if(!document.hidden&&syncToday())safeRender()},60000);
// ---------- helpers ----------
function dayRec(d){return days[d]||(days[d]={sets:{},wt:{}})}
function sessionOf(d){return days[d]?.session||sessionForDow(parse(d).getDay())}
function setsDone(rec){let n=0;for(const a of Object.values(rec?.sets||{}))n+=a.filter(Boolean).length;return n}
function lastWeight(name,before){
  const ds=Object.keys(days).filter(d=>d<before&&days[d].wt&&days[d].wt[name]).sort();
  const d=ds.pop();return d?{d,w:days[d].wt[name],n:(days[d].sets?.[name]||[]).filter(Boolean).length}:null;
}
function lastBW(before){const ds=Object.keys(days).filter(d=>d<=before&&days[d].bw).sort();const d=ds.pop();return d?{d,v:days[d].bw}:null}
const fmtShort=s=>{const d=parse(s);return `${MON[d.getMonth()]} ${d.getDate()}`};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const $=id=>document.getElementById(id);
// ---------- render ----------
function render(){
  const H=$("hdr");
  const tabs=`<div class="seg"><button id="tab-train" data-tab="train" aria-pressed="${view.tab==="train"}">Train</button><button id="tab-year" data-tab="year" aria-pressed="${view.tab==="year"}">Year</button></div>`;
  if(view.tab==="train"){
    const d=parse(view.date),s=sessionOf(view.date),pw=progWeek(view.date);
    H.innerHTML=`<div class="top"><h1 class="brand">Peak on Peak</h1>${tabs}</div>
     <div class="datebar"><button class="icon" id="prev" aria-label="Previous day">‹</button>
      <div class="d"><b>${DOW[d.getDay()]}, ${fmtShort(view.date)}</b><span>${WEEKS[pw.w][0]} · ${pw.mon} week ${pw.i+1} of ${pw.n}${view.date===TODAY?" · today":""}</span></div>
      ${view.date!==TODAY?`<button class="today" id="gotoday">Today</button>`:""}
      <button class="icon" id="next" aria-label="Next day">›</button></div>
     ${s?`<div class="days">${Object.entries(DAYS).map(([k,v])=>`<button id="day-${k}" aria-pressed="${k===s}" data-d="${k}"><b>${v.short}</b><span>${v.tag}</span></button>`).join("")}</div>`:""}`;
    $("app").innerHTML=s?trainView(s,pw):restView();
  }else{
    H.innerHTML=`<div class="top"><h1 class="brand">Peak on Peak</h1>${tabs}</div>
     <div class="datebar"><button class="icon" id="yprev" aria-label="Previous year">‹</button>
      <div class="d"><b>${view.year}</b><span>365-day tracker</span></div>
      <button class="icon" id="ynext" aria-label="Next year">›</button></div>`;
    $("app").innerHTML=yearView();
  }
}
function bwCard(){
  const rec=days[view.date],lb=lastBW(addDays(view.date,-1));
  return `<div class="bw"><div class="lbl"><span class="k">Body weight</span><small>${lb?`Last: ${lb.v} lb on ${fmtShort(lb.d)}`:"Log it any morning to see the trend in Year"}</small></div>
   <label class="num"><input id="bw" type="number" inputmode="decimal" step="0.1" min="50" max="600" placeholder="—" value="${rec?.bw??""}" aria-label="Body weight in pounds"><span>lb</span></label></div>`;
}
function restView(){
  const d=parse(view.date);let nx=view.date;for(let i=1;i<7;i++){const t=addDays(view.date,i);if(sessionForDow(parse(t).getDay())){nx=t;break}}
  const ns=DAYS[sessionForDow(parse(nx).getDay())];
  return `<div class="rest"><span class="k">${DOW[d.getDay()]}</span><h2>Rest day</h2><p>Next: ${ns.title}, ${DOW[parse(nx).getDay()]} ${fmtShort(nx)}.</p>
   <p>Moved a session? Log it here instead:</p>
   <div class="days">${Object.entries(DAYS).map(([k,v])=>`<button id="move-${k}" data-move="${k}"><b>${v.short}</b><span>${v.tag}</span></button>`).join("")}</div></div>
   ${view.date>=PROGRAM_SWITCH?ckCard(false):""}${bwCard()}`;
}
// ---------- readiness check-in ----------
// Each metric scores 0 (fine), 1 (caution) or 2 (poor); -1 = still building a baseline.
// Red: 2+ poor, or 1 poor + 2 caution. Amber: 1 poor, or 2+ caution. One bad metric alone never makes red.
const NEED=10;
const ZT={green:["As planned","Train as written. Feeling great? Work to the top of each RPE range.","--t-hyp"],
 amber:["Ease off","Weights about 8% lighter (1 RPE lower) and one fewer hypertrophy set. Contrast and plyo sets stay. Sprints capped at 85%; one fewer 4×4 interval.","--t-power"],
 red:["Recovery day","Strength at RPE 6 with weights about 15% lighter. Plyo, power and contrast sets are cut; isometrics and mobility stay. Runs drop to the deload version, or swap for 20–30 min of Zone 2.","--t-core"]};
const LOADF={green:1,amber:.92,red:.85};
function baseline(key,d){const v=[];for(let i=1;i<=30;i++){const x=days[addDays(d,-i)]?.ck?.[key];if(typeof x==="number")v.push(x)}return {n:v.length,mean:v.length?v.reduce((a,b)=>a+b,0)/v.length:null}}
function readiness(d){
  const ck=days[d]?.ck||{},out=[];
  if(ck.hrv!=null){const b=baseline("hrv",d);if(b.n>=NEED){const r=ck.hrv/b.mean;out.push(["HRV",r<.85?2:r<.93?1:0,`${r>=1?"+":""}${Math.round((r-1)*100)}% vs ${Math.round(b.mean)} ms avg`])}else out.push(["HRV",-1,`building baseline ${b.n}/${NEED}`])}
  if(ck.rhr!=null){const b=baseline("rhr",d);if(b.n>=NEED){const df=ck.rhr-b.mean;out.push(["Sleeping HR",df>=5?2:df>=3?1:0,`${df>=0?"+":""}${df.toFixed(1)} bpm vs avg`])}else out.push(["Sleeping HR",-1,`building baseline ${b.n}/${NEED}`])}
  if(ck.sleep!=null)out.push(["Sleep",ck.sleep<6?2:ck.sleep<7?1:0,`${ck.sleep} h`]);
  if(ck.sore!=null)out.push(["Soreness",ck.sore>=5?2:ck.sore>=4?1:0,`${ck.sore}/5`]);
  if(ck.energy!=null)out.push(["Energy",ck.energy<=1?2:ck.energy<=2?1:0,`${ck.energy}/5`]);
  if(ck.rd!=null)out.push(["Readiness",ck.rd<60?2:ck.rd<70?1:0,`${ck.rd}`]);
  const sc=out.filter(o=>o[1]>=0),poor=sc.filter(o=>o[1]===2).length,warn=sc.filter(o=>o[1]===1).length;
  const z=sc.length?((poor>=2||(poor===1&&warn>=2))?"red":(poor===1||warn>=2)?"amber":"green"):null;
  return {z,items:out};
}
function zoneOf(d){return d<PROGRAM_SWITCH?"green":(days[d]?.mode||readiness(d).z||"green")}
function adjSets(n,type,z,s){
  if(z==="green")return n;
  if(type==="run")return z==="amber"&&s==="fri"?Math.max(1,n-1):n;
  if(type==="hyp"||type==="sd")return Math.max(1,n-1);
  if(z==="red"&&!["oiso","yiso","mob","cool","str"].includes(type))return Math.max(1,n-1);
  return n;
}
function ckCard(showZone=true){
  const ck=days[view.date]?.ck||{},R=readiness(view.date),auto=R.z,mode=days[view.date]?.mode,z=mode||auto||"green";
  const num=(k,l,u,mn,mx,st)=>`<label class="ckf"><span>${l}</span><span class="num"><input id="ck-${k}" data-ck="${k}" type="number" inputmode="decimal" step="${st}" min="${mn}" max="${mx}" placeholder="—" value="${ck[k]??""}" aria-label="${l} (${u})"><span>${u}</span></span></label>`;
  const scale=(k,l,lo,hi)=>`<div class="ckr"><span class="ckl">${l} <small>1 ${lo} → 5 ${hi}</small></span><div class="chips">${[1,2,3,4,5].map(v=>`<button class="chipb" id="ck-${k}-${v}" data-cks="${k}|${v}" aria-pressed="${ck[k]===v}" aria-label="${l} ${v}">${v}</button>`).join("")}</div></div>`;
  return `<section class="ck" style="--z:var(${ZT[z][2]})">
   <div class="ckh"><span class="k">Morning check-in</span>${auto?`<span class="pill" style="--z:var(${ZT[auto][2]})">${ZT[auto][0]}</span>`:`<span class="sync">Log it before you train</span>`}</div>
   <div class="ckg">${num("hrv","HRV","ms",1,250,1)}${num("rhr","Sleeping HR","bpm",30,120,1)}${num("sleep","Sleep","h",0,14,.25)}${num("rd","Readiness","opt.",0,100,1)}</div>
   ${scale("sore","Soreness","none","very sore")}${scale("energy","Energy","drained","great")}
   ${R.items.length?`<ul class="ckm">${R.items.map(([n,s,t])=>`<li class="s${s}"><b>${n}</b> ${t}</li>`).join("")}</ul>`:""}
   ${showZone?`<div class="zone"><div class="zh"><b>${ZT[z][0]}</b>${mode&&mode!==auto?`<span class="sync">Your call${auto?` · suggested: ${ZT[auto][0]}`:""}</span>`:""}</div><p>${ZT[z][1]}</p>
    <div class="seg zseg">${["green","amber","red"].map(k=>`<button id="zone-${k}" data-zone="${k}" aria-pressed="${k===z}">${ZT[k][0]}</button>`).join("")}</div></div>`:""}
  </section>`;
}
function lastPlanned(name,before){
  const ds=Object.keys(days).filter(d=>d<before&&days[d].wt&&days[d].wt[name]).sort();
  const g=ds.filter(d=>zoneOf(d)==="green"),d=(g.length?g:ds).pop();return d?{d,w:days[d].wt[name]}:null;
}
// Peak week: each strength lift splits into a top set and back-off sets, each with its own weight log.
function itemsFor(s,i,w,d=view.date){
  const [type,items]=progFor(d)[s].blocks[i];
  if(!(type==="str"&&w===4)) return items.map(x=>({...x,key:x.n}));
  return items.flatMap(x=>x.c?[{...x,key:x.n,fixed:3}]:[
    {...x,key:x.n+" · top",sub:"Top set",fixed:1,r:"2–3 @ RPE 8.5–9",note:"Work up in small jumps. Log the heaviest set you hit."},
    {...x,key:x.n+" · back-off",sub:"Back-off sets",l:x.l?x.l+"′":"",fixed:2,r:"2–3 @ 90% of top set",note:"Same reps, crisp bar speed.",back:x.n+" · top"}
  ]);
}
const r5=v=>Math.round(v/5)*5;
const rr=v=>v<50?Math.round(v/2.5)*2.5:r5(v);
function suggest(x,rec){ if(x.back&&rec.wt?.[x.back]) return r5(rec.wt[x.back]*.9); const f=LOADF[zoneOf(view.date)]||1,lp=lastPlanned(x.key,view.date); return lp?(f===1?lp.w:rr(lp.w*f)):null; }
function trainView(s,pw){
  const nw=view.date>=PROGRAM_SWITCH,D=progFor(view.date)[s],rec=days[view.date]||{sets:{},wt:{}};let total=0,done=0,bn=0;
  const z=zoneOf(view.date),f=LOADF[z],ew=(z==="red"&&D.cardio)?3:pw.w;
  const blocks=D.blocks.map(([type],i)=>{
    if(z==="red"&&(type==="plyo"||type==="power"))return "";
    const [name,c]=(nw?TYPES:TYPES_OLD)[type];
    const rows=itemsFor(s,i,pw.w).map((x,j)=>{
      if(z==="red"&&x.c&&/^Contrast/.test(x.note||""))return "";
      const n=adjSets(x.fixed??(x.sw?x.sw[ew]:setsFor(x.s,type,pw.w)),type,z,s);total+=n;
      const arr=rec.sets?.[x.key]||[];let cnt=0;
      const pips=Array.from({length:n},(_,k)=>{const on=!!arr[k];if(on)cnt++;return `<button class="pip" aria-pressed="${on}" aria-label="Set ${k+1}" data-p="${i}|${j}|${k}">${k+1}</button>`}).join("");
      done+=cnt;
      const lw=x.w?lastWeight(x.key,view.date):null,sg=x.w?suggest(x,rec):null;let pl=null;
      return `<div class="ex${cnt===n?" done":""}${x.back?" sub":""}"><div class="row1">${x.l?`<span class="lab">${x.l}</span>`:""}<span class="name">${x.n}</span>${x.sub?`<span class="tag">${x.sub}</span>`:""}</div>
        <div class="rx"><span>${n} × ${x.rw?x.rw[ew]:x.r}</span>${x.rest?`<span class="r">rest ${x.rest}</span>`:""}</div>
        ${x.note?`<p class="tip">${x.note}</p>`:""}
        <div class="logrow">${x.w?`<label class="num"><input type="number" inputmode="decimal" step="2.5" min="0" placeholder="${sg??"—"}" value="${rec.wt?.[x.key]??""}" data-w="${i}|${j}" id="w-${i}-${j}" aria-label="Weight for ${esc(x.key)} in pounds"><span>lb</span></label>`:""}<div class="pips">${pips}</div>
        ${x.back&&rec.wt?.[x.back]?`<span class="last">90% of today's ${rec.wt[x.back]} lb top set = ${sg} lb</span>`:""}${x.w&&!x.back&&f<1&&(pl=lastPlanned(x.key,view.date))?`<span class="last">Plan ${pl.w} lb → today ${rr(pl.w*f)} lb</span>`:""}${lw?`<span class="last">Last: ${lw.w} lb × ${lw.n} set${lw.n===1?"":"s"} · ${fmtShort(lw.d)}</span>`:""}</div></div>`;
    }).join("");
    return `<section class="block" style="--c:var(${c})"><div class="bh"><span class="idx">${pad(++bn)}</span><span class="chip">${name}</span><span class="bar"></span></div><div class="card">${rows}</div></section>`;
  }).join("");
  const pct=total?done/total:0,C=2*Math.PI*28;
  return `<div class="hero"><div><h2>${D.title}</h2><p>${D.sub}</p></div>
    <div class="ring" aria-label="${done} of ${total} sets done"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="var(--line)" stroke-width="6"/><circle cx="32" cy="32" r="28" fill="none" stroke="var(--accent)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg><div class="n">${done}/${total}</div></div></div>
    <div class="note"><span class="k">${WEEKS[pw.w][0]}</span>${D.cardio?D.wk[ew]:WEEKS[pw.w][1]}</div>
    ${nw?ckCard():""}
    ${bwCard()}
    <details class="warm"><summary>Warm-up · ${nw?"5–8":"8–10"} min</summary><div>${D.warm}</div></details>
    ${blocks}
    ${D.extra?`<div class="extra">${D.extra}</div>`:""}
    <button class="ghost" id="reset">Clear this day's log</button>
    <span class="sync" id="sync"></span>`;
}
function yearView(){
  const Y=view.year,yd=Object.keys(days).filter(d=>d.startsWith(Y+"-"));
  const trained=yd.filter(d=>setsDone(days[d])>0);
  let sched=0;const end=Y<+TODAY.slice(0,4)?`${Y}-12-31`:TODAY;
  for(let d=`${Y}-01-01`;d<=end&&d.startsWith(Y+"");d=addDays(d,1)){if(sessionForDow(parse(d).getDay())&&d>=settings.start)sched++}
  const trainedSched=trained.filter(d=>d>=settings.start).length;
  // streak: consecutive scheduled sessions (most recent back) that were logged
  let streak=0;for(let d=TODAY;d>=settings.start;d=addDays(d,-1)){if(!sessionForDow(parse(d).getDay()))continue;if(d===TODAY&&!(setsDone(days[d])>0))continue;if(setsDone(days[d])>0)streak++;else break}
  const bws=yd.filter(d=>days[d].bw).sort().map(d=>({d,v:+days[d].bw}));
  const stats=`<div class="stats"><div class="stat"><b>${trained.length}</b><small>Sessions logged</small></div>
    <div class="stat"><b>${sched?Math.min(100,Math.round(trainedSched/sched*100)):0}%</b><small>Of scheduled days</small></div>
    <div class="stat"><b>${streak}</b><small>Session streak</small></div></div>`;
  return `${stats}
   <div class="panel"><h3>Body weight</h3>${bwChart(bws,Y)}</div>
   <div class="panel"><h3>HRV</h3>${bwChart(yd.filter(d=>days[d].ck?.hrv).sort().map(d=>({d,v:+days[d].ck.hrv})),Y," ms","No HRV entries this year. Add them in the morning check-in.")}</div>
   <div class="panel"><h3>Training days</h3>
    <div class="legend">${Object.values(DAYS).map(v=>`<span><i style="background:var(${v.color})"></i>${v.title}</span>`).join("")}<span><i style="box-shadow:inset 0 0 0 1.5px var(--t-core)"></i>Missed</span></div>
    <div class="months">${months(Y)}</div></div>
   <div class="panel"><h3>Program start</h3>
    <div class="set"><label for="start">Tracking starts</label><input type="date" id="start" value="${settings.start}"><span class="sync">Missed days count from this date. Program weeks follow the calendar month.</span></div></div>
   <div class="panel"><h3>Your data</h3>
    <p class="empty">Everything is stored on this device. Export a backup now and then, or to move your log to another phone.</p>
    <div class="btns"><button class="ghost" id="export">Export backup</button><button class="ghost" id="import">Import backup</button></div>
    <span class="sync" id="sync"></span></div>`;
}
function months(Y){
  let out="";
  for(let m=0;m<12;m++){
    const first=new Date(Y,m,1),len=new Date(Y,m+1,0).getDate(),off=(first.getDay()+6)%7;
    let g=["M","T","W","T","F","S","S"].map(x=>`<span class="w">${x}</span>`).join("")+"<span></span>".repeat(off);
    for(let dd=1;dd<=len;dd++){
      const s=`${Y}-${pad(m+1)}-${pad(dd)}`,rec=days[s],n=setsDone(rec),ses=sessionOf(s);
      let cls="cell",st="";
      if(n>0&&ses){cls+=" done";st=`background:var(${DAYS[ses].color})`}
      else if(ses&&!days[s]?.session&&sessionForDow(parse(s).getDay())&&s>=settings.start){cls+=s<TODAY?" missed":" sched"}
      if(s===TODAY)cls+=" today";
      if(rec?.bw)cls+=" bwdot";
      g+=`<button class="${cls}" style="${st}" data-go="${s}" aria-label="${fmtShort(s)}${n?`, ${n} sets`:""}">${dd}</button>`;
    }
    out+=`<div class="mo"><h4>${MON[m]}</h4><div class="g">${g}</div></div>`;
  }
  return out;
}
function bwChart(pts,Y,u=" lb",none="No entries this year. Log body weight from the Train tab."){
  if(pts.length<2) return `<p class="empty">${pts.length?`One entry so far: ${pts[0].v}${u} on ${fmtShort(pts[0].d)}. Log another day to see the line.`:none}</p>`;
  const W=600,H=170,L=38,R=46,T=12,B=22;
  const doy=s=>(parse(s)-new Date(Y,0,1))/864e5;
  let lo=Math.min(...pts.map(p=>p.v)),hi=Math.max(...pts.map(p=>p.v));const padv=Math.max(1,(hi-lo)*.15);lo=Math.floor(lo-padv);hi=Math.ceil(hi+padv);
  const x=s=>L+doy(s)/365*(W-L-R),y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
  const line=pts.map((p,i)=>`${i?"L":"M"}${x(p.d).toFixed(1)},${y(p.v).toFixed(1)}`).join("");
  const area=`${line}L${x(pts.at(-1).d).toFixed(1)},${H-B}L${x(pts[0].d).toFixed(1)},${H-B}Z`;
  const ticks=[lo,Math.round((lo+hi)/2),hi];
  const mticks=[0,3,6,9].map(m=>{const xx=L+((new Date(Y,m,1)-new Date(Y,0,1))/864e5)/365*(W-L-R);return `<line x1="${xx}" x2="${xx}" y1="${T}" y2="${H-B}" stroke="var(--line)" stroke-width="1"/><text x="${xx}" y="${H-6}" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${MON[m]}</text>`}).join("");
  const lp=pts.at(-1),delta=(lp.v-pts[0].v);
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend over ${Y}">
   ${ticks.map(t=>`<line x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)" stroke-dasharray="3 4"/><text x="${L-6}" y="${y(t)+4}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${t}</text>`).join("")}
   ${mticks}
   <path d="${area}" fill="var(--accent)" fill-opacity=".1"/>
   <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
   <circle cx="${x(lp.d)}" cy="${y(lp.v)}" r="4" fill="var(--accent)"/>
   <text x="${x(lp.d)+7}" y="${y(lp.v)+4}" font-size="12" fill="var(--ink)" font-family="IBM Plex Mono,monospace">${lp.v}</text>
  </svg></div><p class="empty">${lp.v}${u} on ${fmtShort(lp.d)} · ${delta>0?"+":""}${delta.toFixed(1)}${u} since ${fmtShort(pts[0].d)}</p>`;
}
function paintSync(){const el=$("sync");if(el)el.textContent=saveState==="ok"?"Saved on this device":"Couldn't save: storage is full or blocked. Export a backup."}
let pendingRender=false;
function safeRender(){const a=document.activeElement;if(a&&a.tagName==="INPUT"){pendingRender=true;return}render();paintSync()}
document.addEventListener("focusout",()=>{if(pendingRender){pendingRender=false;setTimeout(()=>{render();paintSync()},0)}});
// ---------- toast ----------
let toastT=null;
function toast(msg,btn,fn,ms=4000){
  $("toastmsg").textContent=msg;const b=$("toastbtn");
  if(btn){b.textContent=btn;b.hidden=false;b.onclick=()=>{$("toast").hidden=true;fn()}}else b.hidden=true;
  $("toast").hidden=false;clearTimeout(toastT);if(ms)toastT=setTimeout(()=>{$("toast").hidden=true},ms);
}
// ---------- backup ----------
function exportData(){
  flushSave();
  const blob=new Blob([JSON.stringify({app:"peak-on-peak",version:1,exported:new Date().toISOString(),settings,days},null,1)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`peak-on-peak-${TODAY}.json`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast("Backup exported");
}
function validDays(d){
  if(!d||typeof d!=="object"||Array.isArray(d))return false;
  return Object.entries(d).every(([k,v])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&v&&typeof v==="object");
}
async function importData(file){
  let c;
  try{c=JSON.parse(await file.text())}catch(e){toast("That file isn't a Peak on Peak backup");return}
  if(!c||!validDays(c.days)){toast("That file isn't a Peak on Peak backup");return}
  const n=Object.keys(c.days).length;
  if(!confirm(`Replace the log on this device with the backup (${n} day${n===1?"":"s"})?`))return;
  const prev={settings,days};
  days=c.days;
  for(const r of Object.values(days)){r.sets=r.sets&&typeof r.sets==="object"?r.sets:{};r.wt=r.wt&&typeof r.wt==="object"?r.wt:{}}
  if(c.settings&&/^\d{4}-\d{2}-\d{2}$/.test(c.settings.start||""))settings={...settings,start:c.settings.start};
  save();render();paintSync();
  toast("Backup imported","Undo",()=>{settings=prev.settings;days=prev.days;save();render();paintSync()},8000);
}
$("importfile").addEventListener("change",e=>{const f=e.target.files[0];e.target.value="";if(f)importData(f)});
// ---------- events ----------
let armed=false;
function go(date){view.date=date;view.tab="train";render();paintSync();window.scrollTo(0,0)}
document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  syncToday();
  if(b.dataset.tab){view.tab=b.dataset.tab;if(view.tab==="year")view.year=+view.date.slice(0,4);render();paintSync();window.scrollTo(0,0);return}
  if(b.id==="prev")return go(addDays(view.date,-1));
  if(b.id==="next")return go(addDays(view.date,1));
  if(b.id==="gotoday")return go(TODAY);
  if(b.id==="yprev"){view.year--;render();paintSync();return}
  if(b.id==="ynext"){view.year++;render();paintSync();return}
  if(b.id==="export")return exportData();
  if(b.id==="import")return $("importfile").click();
  if(b.dataset.go)return go(b.dataset.go);
  if(b.dataset.cks){const [k,v]=b.dataset.cks.split("|"),r=dayRec(view.date);r.ck=r.ck||{};if(r.ck[k]===+v)delete r.ck[k];else r.ck[k]=+v;persist();render();paintSync();return}
  if(b.dataset.zone){const r=dayRec(view.date),auto=readiness(view.date).z||"green";if(b.dataset.zone===auto)delete r.mode;else r.mode=b.dataset.zone;persist();render();paintSync();return}
  if(b.dataset.d||b.dataset.move){const r=dayRec(view.date);r.session=b.dataset.d||b.dataset.move;persist();render();paintSync();return}
  if(b.dataset.p){
    const [i,j,k]=b.dataset.p.split("|").map(Number),s=sessionOf(view.date),x=itemsFor(s,i,progWeek(view.date).w)[j],r=dayRec(view.date);
    if(!r.session)r.session=s;
    const a=r.sets[x.key]||(r.sets[x.key]=[]);a[k]=a[k]?0:1;
    if(a[k]&&x.w&&r.wt[x.key]==null){const sg=suggest(x,r);if(sg!=null)r.wt[x.key]=sg}
    if(a[k]&&x.sec)startTimer(x.sec,x.n);
    persist();render();paintSync();return}
  if(b.id==="reset"){
    if(!armed){armed=true;b.textContent="Tap again to clear";b.classList.add("arm");setTimeout(()=>{armed=false;const r=$("reset");if(r){r.textContent="Clear this day's log";r.classList.remove("arm")}},3000);return}
    armed=false;const r=dayRec(view.date);r.sets={};r.wt={};persist();render();paintSync();}
});
document.addEventListener("input",e=>{
  const t=e.target;
  if(t.dataset.ck){const r=dayRec(view.date);r.ck=r.ck||{};const v=parseFloat(t.value);if(isNaN(v))delete r.ck[t.dataset.ck];else r.ck[t.dataset.ck]=v;persist();pendingRender=true;return}
  if(t.id==="bw"){const r=dayRec(view.date);const v=parseFloat(t.value);if(isNaN(v))delete r.bw;else r.bw=v;persist();return}
  if(t.dataset.w){const [i,j]=t.dataset.w.split("|").map(Number),s=sessionOf(view.date),x=itemsFor(s,i,progWeek(view.date).w)[j],r=dayRec(view.date);
    if(!r.session)r.session=s;const v=parseFloat(t.value);if(isNaN(v))delete r.wt[x.key];else r.wt[x.key]=v;persist();return}
});
document.addEventListener("change",e=>{
  if(e.target.id==="start"&&e.target.value){settings.start=e.target.value;persist();render();paintSync()}
});
// ---------- rest timer ----------
// Keeps the screen awake while a rest is counting down, so the phone doesn't lock mid-set.
let end=0,tick=null,wake=null;
async function holdWake(){try{if(!wake&&navigator.wakeLock&&!document.hidden){wake=await navigator.wakeLock.request("screen");wake.addEventListener("release",()=>{wake=null})}}catch(e){}}
function dropWake(){try{wake&&wake.release()}catch(e){}wake=null}
function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+pad(s%60)}
function startTimer(sec,label){end=Date.now()+sec*1000;$("tl").textContent="Rest · "+label;$("timer").classList.add("on");$("timer").classList.remove("zero");clearInterval(tick);tick=setInterval(step,250);step();holdWake()}
function step(){const left=(end-Date.now())/1000;$("tt").textContent=fmt(left);if(left<=0){$("timer").classList.add("zero");$("tl").textContent="Rest over. Next set.";clearInterval(tick);tick=null;dropWake();try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}}
$("tplus").onclick=()=>{end=Math.max(end,Date.now())+15000;$("timer").classList.remove("zero");clearInterval(tick);tick=setInterval(step,250);step();holdWake()};
$("tskip").onclick=()=>{clearInterval(tick);tick=null;dropWake();$("timer").classList.remove("on")};
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&tick)holdWake()});
// ---------- app shell ----------
let wantReload=false;
if("serviceWorker" in navigator&&location.protocol!=="file:"){
  addEventListener("load",()=>{
    navigator.serviceWorker.register("sw.js").then(reg=>{
      const offer=w=>toast("A new version is ready","Reload",()=>{wantReload=true;w.postMessage("skipWaiting")},0);
      if(reg.waiting&&navigator.serviceWorker.controller)offer(reg.waiting);
      reg.addEventListener("updatefound",()=>{const w=reg.installing;w&&w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller)offer(w)})});
    }).catch(()=>{});
    // Reload only when the viewer tapped Reload on an update. The first install also
    // fires controllerchange, and reloading then would reset the page to today mid-use.
    let reloaded=false;
    navigator.serviceWorker.addEventListener("controllerchange",()=>{if(reloaded||!wantReload)return;reloaded=true;flushSave();location.reload()});
  });
}
render();paintSync();
