import { useState } from 'react';
import Layout from './components/layout/Layout';
import Navbar from './components/layout/Navbar';
import ColorPalette from './components/tools/ColorPalette';
import GradientGenerator from './components/tools/GradientGenerator';
import FancyFonts from './components/tools/FancyFonts';
import AudioVisualizer from './components/tools/AudioVisualizer';
import BackgroundRemover from './components/tools/BackgroundRemover';
import UnitConverter from './components/tools/UnitConverter';
import WordCounter from './components/tools/WordCounter';
import QRGenerator from './components/tools/QRGenerator';
import PasswordGenerator from './components/tools/PasswordGenerator';
import MarkdownPreviewer from './components/tools/MarkdownPreviewer';
import ShadowGenerator from './components/tools/ShadowGenerator';
import useDarkMode from './hooks/useDarkMode';

const TOOLS = {
  palette:   ColorPalette,
  gradient:  GradientGenerator,
  fonts:     FancyFonts,
  audio:     AudioVisualizer,
  bgremove:  BackgroundRemover,
  units:     UnitConverter,
  words:     WordCounter,
  qr:        QRGenerator,
  password:  PasswordGenerator,
  markdown:  MarkdownPreviewer,
  shadow:    ShadowGenerator,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('palette');
  const [dark, setDark] = useDarkMode();
  const Tool = TOOLS[activeTab];

  return (
    <Layout dark={dark} onToggleDark={() => setDark(d => !d)}>
      {/* key forces remount + animation on tab switch */}
      <Tool key={activeTab} />
      <Navbar active={activeTab} onChange={setActiveTab} />
    </Layout>
  );
}
