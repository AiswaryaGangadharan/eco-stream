// This component shows ONE category section:
// a heading + a horizontal scrollable row of VideoCards.

import { Video } from "../../types/video";
import VideoCard from "./VideoCard";

type Props = {
  category: string;   // e.g. "Solar Energy"
  videos: Video[];    // all videos belonging to this category
};

export default function CategoryRow({ category, videos }: Props) {
  return (
    <section className="mb-10">

      {/* ── Category heading ── */}
      <div className="flex items-center gap-3 mb-4 px-4 md:px-8">
        {/* Green accent bar on the left */}
        <span className="w-1 h-5 bg-green-500 rounded-full" />
        <h2 className="text-base sm:text-lg font-semibold text-white">
          {category}
        </h2>
      </div>

      {/* ── Horizontal scroll container ── */}
      <div className="
        flex gap-3 sm:gap-4
        overflow-x-auto           /* Enable horizontal scrolling */
        scroll-smooth             /* Smooth scroll feel */
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] /* Native scrollbar hide - no plugin needed */
        px-4 md:px-8              /* Side padding so first card isn't flush to edge */
        pb-2
      ">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

    </section>
  );
}