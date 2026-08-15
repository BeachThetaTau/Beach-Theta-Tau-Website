import BingoBoard from "../components/BingoBoard/BingoBoard";

export function RetreatPage() {
  return (
    <section className="section section-muted">
      <div className="container-narrow text-center">
        <p className="eyebrow">Brotherhood Retreat</p>
        <h1 className="section-title">Retreat Bingo</h1>
        <p className="lead mx-auto mt-4 max-w-[42rem]">
          Tap a square each time you catch it happening. Fill a row, column, or diagonal and you
          have bingo — proof you actually talked to your brothers.
        </p>
      </div>
      <div className="mt-10">
        <BingoBoard />
      </div>
    </section>
  );
}

export default RetreatPage;
