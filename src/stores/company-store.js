import { defineStore } from "pinia";

export const useStore = defineStore("store", {
  state: () => ({
    companies: [
      {
        name: "Cruise",
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Cruise_Logo.svg",
        description: "Autonomous Vehicles",
        rating: 4.5,
        reviews: 120,
      },
      {
        name: "DoorDash",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/DoorDash_Logo.png",
        description: "Food Delivery Platform",
        rating: 4.2,
        reviews: 95,
      },
      {
        name: "Airbnb",
        logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Bélo.svg",
        description: "Online Travel Booking",
        rating: 4.6,
        reviews: 180,
      },
      {
        name: "Figma",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
        description: "Design Collaboration Tool",
        rating: 4.8,
        reviews: 210,
      },
      {
        name: "Stripe",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Stripe_Logo%2C_revised_2016.svg",
        description: "Payment Processing Platform",
        rating: 4.7,
        reviews: 160,
      },
      {
        name: "Netflix",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
        description: "Streaming Entertainment Service",
        rating: 4.3,
        reviews: 240,
      },
      {
        name: "Spotify",
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
        description: "Music Streaming Service",
        rating: 4.4,
        reviews: 200,
      },
      {
        name: "Notion",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Notion_logo.svg",
        description: "Productivity and Notes Tool",
        rating: 4.6,
        reviews: 130,
      },
      {
        name: "Spotify",
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
        description: "Music Streaming Service",
        rating: 4.4,
        reviews: 200,
      },
      {
        name: "Notion",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Notion_logo.svg",
        description: "Productivity and Notes Tool",
        rating: 4.6,
        reviews: 130,
      },
    ],
  }),

  getters: {
    getAllCompanies(state) {
      return state.companies;
    },
  },

  actions: {
    async fetchCompanies() {
      try {
        // Simulated API call for future integration
        // const res = await fetch('https://your-api.com/companies');
        // this.companies = await res.json();
        console.log("Simulated async fetch – still using static data");
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    },
  },
});
