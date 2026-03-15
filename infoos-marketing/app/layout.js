import './globals.css';
import AuthContext from '../components/auth/AuthContext';

export const metadata = {
  title: 'InfoOS | Modern POS & Retail Management',
  description: 'Run your shop smarter with InfoOS. A sleek, reliable, and engineering-grade POS system for modern businesses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthContext>
          {children}
        </AuthContext>
      </body>
    </html>
  );
}
