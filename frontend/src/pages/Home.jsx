export default function Home() {
  return (
    <main className="bg-[var(--black-olive)] text-[var(--sage)]">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/your-hero-image.jpg')" }}>
        <div className="bg-black/50 p-8 rounded-xl backdrop-blur-sm max-w-2xl">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
            Welcome to Jack's Landing RV Resort
          </h1>
          <p className="text-lg mb-6">
            Your peaceful getaway in the heart of Grants Pass, Oregon.
          </p>
          <button className="bg-[var(--raw-umber)] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[var(--sage)] hover:text-[var(--black-olive)] transition duration-300">
            Book Now
          </button>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 px-6 text-center bg-[var(--sage)] text-[var(--black-olive)]">
        <h2 className="text-3xl font-bold mb-10">Why Stay With Us?</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Scenic Nature</h3>
            <p>Surrounded by trees, rivers, and Oregon’s serene outdoors.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Modern Amenities</h3>
            <p>Wi-Fi, full hookups, showers, and laundry all included.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Pet Friendly</h3>
            <p>Bring the whole family – we love furry friends too.</p>
          </div>
        </div>
      </section>

      {/* About / Amenities */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Explore Our Park</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          From full hookup sites to cozy campfire areas, Jack’s Landing offers comfort and adventure. Whether you're staying for a night or a month, you’ll feel at home.
        </p>
        <button className="bg-[var(--raw-umber)] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[var(--sage)] hover:text-[var(--black-olive)] transition duration-300">
          View Availability
        </button>
      </section>

      {/* Testimonials */}
      <section className="bg-white text-[var(--black-olive)] py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">What Guests Say</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <div className="bg-[var(--sage)] p-6 rounded-xl">
            <p>"Absolutely stunning RV park. Quiet and clean. We’ll be back!"</p>
            <span className="block mt-4 font-semibold">— Sarah M.</span>
          </div>
          <div className="bg-[var(--sage)] p-6 rounded-xl">
            <p>"The amenities were top-notch and the setting was so peaceful."</p>
            <span className="block mt-4 font-semibold">— John D.</span>
          </div>
          <div className="bg-[var(--sage)] p-6 rounded-xl">
            <p>"Perfect stop on our trip through Oregon. Highly recommend!"</p>
            <span className="block mt-4 font-semibold">— Elena G.</span>
          </div>
        </div>
      </section>
    </main>
  );
}