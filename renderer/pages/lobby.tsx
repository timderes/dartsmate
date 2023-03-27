import { NextPage } from "next";
import SidebarLayout from "@/components/layouts/SidebarLayout";
import { Slide, toast } from "react-toastify";
import { matchMaxPlayers as maxPlayers } from "utils/constants";
import { getProfiles } from "hooks/useQuery";
import Avatar from "@/components/avatars/Avatar";
import { useState } from "react";
import {
  HiCog,
  HiDotsHorizontal,
  HiUserAdd,
  HiUserGroup,
  HiUserRemove,
} from "react-icons/hi";
import Button from "@/components/Button";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { createGame } from "utils/games/create";

const Lobby: NextPage = () => {
  const router = useRouter();
  const { isLoading, data } = getProfiles();
  const { register, handleSubmit, getValues } = useForm({
    defaultValues: {
      scoreMode: "501",
      legs: "1",
      sets: "3",
      randomizePlayerOrder: undefined,
    },
  });

  const onSubmit = (data) => {
    return data;
  };

  const [backgroundBlur, setBackgroundBlur] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const handleGameStart = () => {
    const lobbySettings = {
      scoreMode: getValues("scoreMode"),
      legs: getValues("legs"),
      sets: getValues("sets"),
      randomizePlayerOrder: getValues("randomizePlayerOrder"),
      players: selectedPlayers,
      uuid: crypto.randomUUID(),
      createdAt: Date.now(),
      appVersion: "",
      currentPlayer: 0,
      matchHistory: [],
    };
    console.info(lobbySettings);

    createGame(lobbySettings);
  };

  const handlePlayerSelection = (player: ProfileFile) => {
    if (selectedPlayers.includes(player)) {
      const updatedSelectedPlayers = selectedPlayers.filter(
        (selectedPlayer) => selectedPlayer !== player
      );
      setSelectedPlayers(updatedSelectedPlayers);
      return;
    }

    if (selectedPlayers.length >= maxPlayers) {
      toast.error(
        `The lobby is full! You reached the maximum player capacity of ${maxPlayers}. Please remove a player, before you can add ${player.name} as a player.`,
        {
          position: toast.POSITION.TOP_RIGHT,
          theme: "dark",
          transition: Slide,
          className: "text-sm",
          icon: false,
          autoClose: 10000,
        }
      );
      return;
    }

    setSelectedPlayers((state) => [...state, player]);
  };

  if (isLoading) return <>Loading..</>;

  return (
    <SidebarLayout title="Lobby">
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div
          className={`drawer-content flex flex-col ${
            backgroundBlur ? "blur" : ""
          }`}
        >
          <header className="w-full bg-base-200 p-4">
            <h1 className="text-white">Lobby</h1>
            <p className="mb-0">
              Please select all players who want to participate in the game. You
              can select up to {maxPlayers} players. Click on a player profile
              to add them the new game.
            </p>
          </header>

          <ul className="menu menu-horizontal w-full bg-base-300 text-white">
            <li>
              <label
                htmlFor="my-drawer"
                className="btn-ghost btn rounded-none"
                onClick={() => setBackgroundBlur(!backgroundBlur)}
              >
                <HiUserGroup /> Players
              </label>
            </li>
            <li className="mr-8 flex-1 items-center justify-end bg-base-200 font-mono text-xs uppercase">
              Players: {selectedPlayers.length} / {maxPlayers}
            </li>
            <li className="ml-auto">
              <button className="btn-disabled btn" disabled>
                <HiDotsHorizontal />
              </button>
            </li>
          </ul>

          <div className="flex w-full flex-1 items-start">
            <section className="grid w-full grid-cols-2 xl:grid-cols-4 xl:gap-y-16">
              {selectedPlayers.map((player) => (
                <div
                  className="card inline-flex items-center justify-center gap-y-4 rounded-none p-4 text-center transition-all hover:bg-base-300 xl:text-xl xl:font-bold"
                  key={player.uuid}
                >
                  <Avatar
                    imgSrc={player.avatar_image}
                    name={player.name}
                    size="w-16 xl:w-32"
                  />
                  {player.name}
                </div>
              ))}
            </section>
            <aside className="flex w-96 flex-col justify-between self-stretch overflow-hidden bg-base-200">
              <main className="p-4">
                <p className="flex items-center gap-4 text-xl font-bold">
                  <HiCog className="text-3xl hover:animate-spin" />
                  Settings
                </p>
                <form onChange={handleSubmit(onSubmit)}>
                  <div className="form-control">
                    <label className="label" htmlFor="score-mode">
                      <span className="label-text">Score Mode</span>
                    </label>
                    <select
                      className="select w-full max-w-xs px-4"
                      id="score-mode"
                      {...register("scoreMode")}
                    >
                      <option value={501}>501</option>
                      <option value={301}>301</option>
                      <option value={201}>201</option>
                    </select>
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Sets</span>
                    </label>
                    <input
                      type="number"
                      className="input-bordered input w-full"
                      {...register("sets")}
                    />
                  </div>
                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text">Legs</span>
                    </label>
                    <input
                      type="number"
                      className="input-bordered input w-full"
                      {...register("legs")}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label" htmlFor="randomizePlayerOrder">
                      <span className="label-text">
                        Randomize player order?
                      </span>
                    </label>
                    <select
                      className="select w-full max-w-xs px-4"
                      id="randomizePlayerOrder"
                      {...register("randomizePlayerOrder")}
                    >
                      <option value={"true"}>Yes</option>
                      <option value={"false"}>No</option>
                    </select>
                  </div>
                </form>
              </main>
              <button
                className={`btn-primary btn h-32 w-full self-end rounded-none text-3xl ${
                  selectedPlayers.length < 1 ? "btn-disabled" : "animate-pulse"
                }`}
                {...(selectedPlayers.length < 1 ? { disabled: true } : {})}
                onClick={() => handleGameStart()}
              >
                Start Game
              </button>
            </aside>
          </div>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer"
            className="drawer-overlay"
            onClick={() => setBackgroundBlur(!backgroundBlur)}
          ></label>
          <ul className="menu w-80 bg-base-100 p-4 text-base-content">
            <li>
              <Button
                action={() => router.push("/profiles/createProfile?from=lobby")}
                color="ghost"
              >
                Create A New Profile
              </Button>
              <button disabled className="btn-disabled btn-ghost btn mt-2">
                Add Guest
              </button>
            </li>

            <li className="cursor-default border-b border-primary bg-transparent text-sm"></li>
            {data.map((player) => (
              <li className="flex flex-row" key={player.uuid}>
                <span
                  className="flex-1"
                  onClick={() => handlePlayerSelection(player)}
                >
                  <Avatar imgSrc={player.avatar_image} name={player.name} />
                  {player.name}
                </span>
                <button
                  className="text-2xl"
                  onClick={() => handlePlayerSelection(player)}
                >
                  {selectedPlayers.includes(player) ? (
                    <HiUserRemove />
                  ) : (
                    <HiUserAdd />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Lobby;
