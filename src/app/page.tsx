export default function Home() {
  return (
    <>
      <div className="pt-4 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Where to go?</h1>
        <p className="text-sm text-muted-foreground">Hangout, date, or food.</p>
      </div>

      <section className="grid aspect-square place-items-center rounded-2xl bg-muted text-sm text-muted-foreground">
        Map
      </section>

      <section className="flex-1 py-4">
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          Places
        </h2>
        <p className="text-sm text-muted-foreground">No places yet.</p>
      </section>
    </>
  );
}
