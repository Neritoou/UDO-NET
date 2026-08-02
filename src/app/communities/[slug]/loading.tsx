export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">

                <div className="relative h-40 sm:h-52 -mx-4 sm:mx-0">
                    <div className="h-full w-full rounded-b-xl sm:rounded-xl bg-gray-900 animate-pulse-slow" />
                    <div className="absolute -bottom-10 left-4 sm:left-6 h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-gray-950 bg-gray-800 animate-pulse-slow" />
                </div>

                <section className="mt-12 sm:mt-14 px-1 sm:px-2 space-y-2">
                    <div className="h-6 w-48 rounded bg-gray-800 animate-pulse-slow" />
                    <div className="h-4 w-72 rounded bg-gray-900 animate-pulse-slow" />
                </section>

                <div className="mt-8 grid grid-cols-12 gap-8">
                    <section className="col-span-12 lg:col-span-8">
                        <div className="h-40 rounded-xl border border-dashed border-gray-800 bg-gray-900/40 animate-pulse-slow" />
                    </section>
                    <aside className="hidden lg:block lg:col-span-4 space-y-3">
                        <div className="h-32 rounded-2xl bg-gray-900 animate-pulse-slow" />
                        <div className="h-32 rounded-2xl bg-gray-900 animate-pulse-slow" />
                    </aside>
                </div>

            </div>
        </main>
    );
}