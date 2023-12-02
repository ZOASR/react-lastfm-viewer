import { createContext, useEffect, useState } from "react";
import { getLatestTrack, TrackInfo } from "./lastfm";

import TrackProgressBar from "./TrackProgressBar/TrackProgressBar";
import PastTracks from "./PastTracks/PastTracks";

import { MdOutlinePerson3 } from "react-icons/md";
import { FaLastfmSquare } from "react-icons/fa";
import { FaCompactDisc } from "react-icons/fa";
import { SiMusicbrainz } from "react-icons/si";

import { prominent } from "color.js";

import disc from "./disc.svg";
import "../index.css";

export interface Colors {
	primary: string | undefined;
	secondary: string | undefined;
	accent: string | undefined;
}
interface Props {
	api_key: string;
	user: string;
	updateInterval?: number;
}

export const lfmContext = createContext<{
	colors: Colors | undefined;
	track: TrackInfo | Error | undefined;
}>({
	colors: { primary: "white", secondary: "black", accent: "#aaa" },
	track: {
		trackName: "",
		artistName: "",
		albumTitle: "",
		MBImages: [],
		lastfmImages: [],
		nowplaying: false,
		pastTracks: [],
		duration: 0,
	},
});

const ReactLastFMViewer = ({ api_key, user, updateInterval }: Props) => {
	const [track, setTrack] = useState<TrackInfo | Error>();
	const [colors, setColors] = useState<Colors | undefined>();
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const get = async () => {
			const data: TrackInfo | Error = await getLatestTrack(user, api_key);
			if (data instanceof Error) {
				setTrack(data);
				setMessage(data.message.replace("lastfm-ts-api: ", ""));
				setLoading(false);
			} else {
				setTrack(data);
				setLoading(false);
			}
		};
		get();
		let intervalRef: number;
		if (updateInterval) {
			intervalRef = setInterval(() => {
				get();
			}, updateInterval);
		}
		return () => {
			if (updateInterval) clearInterval(intervalRef);
		};
	}, []);
	useEffect(() => {
		if (!(track instanceof Error)) {
			if (track && track.MBImages) {
				const imageUrl: string = track.MBImages[0].image;
				prominent(imageUrl, {
					amount: 100,
					format: "hex",
					sample: 100,
				}).then((color) => {
					const color1: string = color[0] as string;
					const color2: string = color[98] as string;
					const color3: string = color[51] as string;
					setColors({
						primary: color1,
						secondary: color2,
						accent: color3,
					});
				});
			}
		}
	}, [track]);

	return (
		<lfmContext.Provider value={{ colors: colors, track: track }}>
			<div
				className="flex  flex-col w-full h-full glass mx-auto shadow-xl relative ring-2 rounded-lg ring-slate-950/5 p-4"
				style={{ background: colors?.primary }}
			>
				{track instanceof Error ? (
					<div>
						{track.message ==
						"NetworkError when attempting to fetch resource." ? (
							""
						) : (
							<h1>
								Hello developer👋, please consider handling the
								following error before deployment:
							</h1>
						)}

						<div className="text-red-200 text-xl p-5 bg-red-900 rounded-lg w-11/12 mx-auto my-4 shadow-inner">
							{message}
						</div>
					</div>
				) : (
					<>
						<figure
							className="h-auto mx-auto overflow-hidden border-inherit mb-2 rounded-lg"
							style={{
								boxShadow: `0 0 20px ${colors?.secondary}99`,
							}}
						>
							{track?.MBImages ? (
								<img
									className="object-cover w-min overflow-hidden"
									src={track.MBImages[0].image}
									alt="Album Cover"
								/>
							) : track?.lastfmImages ? (
								<img
									className="object-cover w-min overflow-hidden"
									src={track.lastfmImages[3]["#text"]}
									alt="Album Cover"
								/>
							) : (
								<img
									src={disc}
									className=""
									alt="Default album cover thumbnail"
								/>
							)}
						</figure>

						<div className="flex flex-col gap-1 filter drop-shadow-lg h-min">
							{track?.nowplaying ? <TrackProgressBar /> : ""}
							<h1
								className="sm:text-base text-xs shadow:lg text-center mx-auto mt-1 font-bold"
								style={{ color: colors?.secondary }}
							>
								{loading ? (
									<div className="skeleton h-8 w-fit"></div>
								) : track?.trackName ? (
									track?.trackName
								) : (
									"Track title not available"
								)}
							</h1>
							<div
								style={{ color: colors?.secondary }}
								className="text-xs"
							>
								{loading ? (
									<div className="flex justify-center">
										<div className="skeleton mr-2 h-4 w-4 rounded-full"></div>
										<div className="skeleton h-4 w-1/2"></div>
									</div>
								) : track?.artistName ? (
									<span className="flex justify-center items-center gap-1">
										<MdOutlinePerson3 />
										{track?.artistName}
									</span>
								) : (
									"Artist name not available"
								)}
								{loading ? (
									<div className="flex justify-center">
										<div className="skeleton mr-2 h-4 w-4 rounded-full"></div>
										<div className="skeleton h-4 w-1/2"></div>
									</div>
								) : track?.albumTitle ? (
									<span className="flex justify-center items-center gap-1">
										<FaCompactDisc />
										{track?.albumTitle}
									</span>
								) : (
									"Album name is not Available"
								)}
							</div>
							<PastTracks />
							<div
								style={{ color: colors?.secondary }}
								className="flex w-full  mt-2 filter drop-shadow-lg justify-between"
							>
								<span className="flex gap-2">
									<a
										href="https://www.last.fm/"
										target="_blank"
										className="h-min self-center "
									>
										<FaLastfmSquare />
									</a>
									<a
										href="https://musicbrainz.org/"
										target="_blank"
									>
										<SiMusicbrainz />
									</a>
								</span>
								<a
									className=" text-xs"
									href={`https://www.last.fm/user/${user}`}
								>
									user: {user}
								</a>
							</div>
						</div>
					</>
				)}
			</div>
		</lfmContext.Provider>
	);
};

export default ReactLastFMViewer;
