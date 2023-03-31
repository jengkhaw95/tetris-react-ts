import {Link, useNavigate} from "react-router-dom";
import {uuid} from "../../utils";
import IconMultiUser from "../components/icons/multi-user";
import IconUser from "../components/icons/user";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col md:flex-row items-center gap-12 md:justify-center">
      <Link
        to="/play"
        className="px-6 rounded border shadow flex flex-col gap-6 items-center justify-center w-60 h-60"
      >
        <IconUser size={32} className="text-slate-700" />
        <div className="text-xl text-center text-slate-500 ">Single Player</div>
      </Link>
      <button
        onClick={() => {
          navigate(`/room/${uuid()}`);
        }}
        className="px-6 rounded border shadow flex flex-col gap-6 items-center justify-center w-60 h-60"
      >
        <IconMultiUser size={32} className="text-slate-700" />
        <div className="text-xl text-center text-slate-500 ">Multi Player</div>
      </button>
    </div>
  );
}
