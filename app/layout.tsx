import "./globals.css";

export const metadata = {
  title: "emoji.cx",
  description: "🤓 Text to Emoji, based on AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
