export default function Home() {
  return (
    <div className="p-6 bg-[var(--black-olive)] text-[var(--sage)] min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-4">
        Welcome to Jack's Landing RV Resort
      </h1>
      <p className="text-lg text-center max-w-xl mx-auto">
        Enjoy the peaceful nature of Grants Pass, Oregon.
      </p>
      <div className="flex justify-center mt-8">
        <button className="bg-[var(--raw-umber)] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[var(--sage)] hover:text-[var(--black-olive)] transition-colors duration-300">
          Book Now
        </button>
      </div>
    </div>
  );
}
