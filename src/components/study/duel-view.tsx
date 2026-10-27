"use client";

import { useDuelSocket } from "./duel/use-duel-socket";
import DuelSetup from "./duel/duel-setup";
import DuelWaiting from "./duel/duel-waiting";
import DuelCountdown from "./duel/duel-countdown";
import DuelDone from "./duel/duel-done";
import DuelPlay from "./duel/duel-play";

// ------------------------------------------------------------------
// نبرد دودنفره — مصاف زندهٔ واژگانی با یادگیرندهٔ دیگر روی همین کتاب.
// داوری متمرکز: سرویس socket.io (پورت ۳۰۰۳ از طریق گیت‌وی) خودش بانک
// ۴۹۰ سؤال را دارد، ترتیب سؤال‌ها و بُر گزینه‌ها را صادر می‌کند و
// درستیِ هر پاسخ را خودش اعتبارسنجی می‌کند (اعتمادی به کلاینت نیست).
// کلاینت فقط id + perm می‌گیرد و متن را از بانک استاتیک خودش رندر
// می‌کند؛ بازخورد فوری هم چون کلیدها در بانک عمومی‌اند محلی است.
//
// گام ۷ §12: این فایل فقط «رسان فاز» است — ماشین حالت سوکت در
// duel/use-duel-socket و هر فاز یک نمای مستقل در duel/.
// ------------------------------------------------------------------

export default function DuelView() {
  const d = useDuelSocket();

  if (d.phase === "setup") {
    return (
      <DuelSetup
        conn={d.conn}
        createRoom={d.createRoom}
        joinRoom={d.joinRoom}
        joinInput={d.joinInput}
        setJoinInput={d.setJoinInput}
        joinBusy={d.joinBusy}
        nameDraft={d.nameDraft}
        setNameDraft={d.setNameDraft}
        createBusy={d.createBusy}
        paceChoices={d.paceChoices}
        chosenPace={d.chosenPace}
        choosePace={d.choosePace}
      />
    );
  }

  if (d.phase === "waiting") {
    return <DuelWaiting roomCode={d.roomCode} players={d.players} mySid={d.mySid} paceMs={d.paceMs} copyCode={d.copyCode} leaveRoom={d.leaveRoom} />;
  }

  if (d.phase === "countdown") {
    return <DuelCountdown countdownLeft={d.countdownLeft} players={d.players} />;
  }

  if (d.phase === "done" && d.endData) {
    return (
      <DuelDone
        endData={d.endData}
        mySid={d.mySid}
        myFinishAt={d.myFinishAt}
        oppConnected={d.oppConnected}
        rematchVotes={d.rematchVotes}
        rematch={d.rematch}
        leaveRoom={d.leaveRoom}
      />
    );
  }

  // play (یا انتظار برای پایان حریف)
  return (
    <DuelPlay
      me={d.me}
      opp={d.opp}
      total={d.total}
      cur={d.cur}
      curQ={d.curQ}
      correctIdx={d.correctIdx}
      qi={d.qi}
      picked={d.picked}
      feedback={d.feedback}
      myDone={d.myDone}
      oppLeft={d.oppLeft}
      answer={d.answer}
      timeLeft={d.timeLeft}
      paceMs={d.paceMs}
    />
  );
}
