import "./globals.css";

export const metadata = {
  title: "Harsh Tiwari — Builder & Learner",
  description:
    "Product builder in progress. Shipping real apps with AI-assisted development while learning Python, data analysis, SQL, and automation from the ground up.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&family=Fira+Code:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
