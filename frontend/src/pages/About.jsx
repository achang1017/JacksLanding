// frontend/src/pages/About.jsx
import React from 'react';

export default function About() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">About Jack's Landing</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            Welcome to Jack's Landing RV Resort, your premier destination for RV camping in the beautiful Rogue Valley of Southern Oregon. 
            Nestled in the heart of Grants Pass, our family-owned resort has been providing exceptional hospitality to travelers for over 20 years.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-6">
            Jack's Landing was founded by Jack and Mary Thompson in 2000, with a vision to create a welcoming home away from home for RV enthusiasts. 
            What started as a small park with just 20 sites has grown into a modern resort with over 50 full-service RV sites, while maintaining 
            the personal touch and family atmosphere that our guests love.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Location & Attractions</h2>
          <p className="text-gray-600 mb-6">
            Located just minutes from the famous Rogue River, our resort offers easy access to world-class fishing, rafting, and hiking. 
            Downtown Grants Pass is only a short drive away, where you'll find charming shops, restaurants, and the historic downtown district.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment</h2>
          <p className="text-gray-600 mb-6">
            We're committed to providing clean, safe, and comfortable accommodations for all our guests. Whether you're staying for a night, 
            a week, or a season, we strive to make your stay at Jack's Landing memorable and relaxing.
          </p>
        </div>
      </div>
    </div>
  );
}