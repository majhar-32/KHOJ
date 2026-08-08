export default function Home() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          Khoj — Frontend Setup Complete
        </h1>
        <p className="mt-3 text-sm text-neutral-600 sm:text-base">
          Project scaffold, design system, reusable components, and mock data
          are ready. The Landing page and the rest of the screens will be
          built in the next phases.
        </p>
        <p className="mt-4 text-sm">
          Check the component library at{" "}
          <a href="/dev/components" className="font-medium text-primary-600 underline">
            /dev/components
          </a>
        </p>
      </div>
    </div>
  );
}
