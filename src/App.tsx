import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { LikesProvider } from "@/contexts/LikesContext";
import { EqualizerProvider } from "@/contexts/EqualizerContext";
import MainLayout from "@/components/layout/MainLayout";
import MobileNav from "@/components/layout/MobileNav";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import NowPlaying from "./components/player/NowPlaying";
import Queue from "./pages/Queue";
import Equalizer from "./pages/Equalizer";
import Playlist from "./pages/Playlist";
import LikedSongs from "./pages/LikedSongs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <PlayerProvider>
        <LikesProvider>
          <EqualizerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/queue" element={<Queue />} />
                    <Route path="/equalizer" element={<Equalizer />} />
                    <Route path="/playlist/:id" element={<Playlist />} />
                    <Route path="/liked" element={<LikedSongs />} />
                  </Route>
                  <Route path="/now-playing" element={<NowPlaying />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <MobileNav />
              </BrowserRouter>
            </TooltipProvider>
          </EqualizerProvider>
        </LikesProvider>
      </PlayerProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
