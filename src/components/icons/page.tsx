import { AiFillFilePdf, AiOutlineYoutube } from "react-icons/ai";
import { BiWorld } from "react-icons/bi";
import {
  BsFillExclamationDiamondFill,
  BsFillGrid3X3GapFill,
  BsPersonPlus,
  BsThreeDotsVertical,
} from "react-icons/bs";
import {
  CiBank,
  CiEdit,
  CiLock,
  CiSettings,
  CiSquareMore,
  CiWarning
} from "react-icons/ci";
import {
  FaApple,
  FaCalculator,
  FaDollarSign,
  FaFacebookF,
  FaHome,
  FaMapMarkerAlt,
  FaMicrophone,
  FaMicrophoneSlash,
  FaStar,
  FaStarHalfAlt,
  FaVideo,
  FaVideoSlash,
  FaWhatsapp
} from "react-icons/fa";
import {
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaBookOpenReader,
  FaKipSign,
  FaLinkedinIn,
  FaListUl,
  FaUserDoctor,
  FaUserPlus,
} from "react-icons/fa6";
import { FcEndCall, FcGoogle, FcHome } from "react-icons/fc";
import { FiArrowDownLeft, FiUser } from "react-icons/fi";
import { GiCircle, GiHospitalCross } from "react-icons/gi";
import { GoDotFill, GoPlus } from "react-icons/go";
import {
  GrFormNext,
  GrFormNextLink,
  GrFormPrevious,
  GrFormPreviousLink
} from "react-icons/gr";
import { HiMenuAlt2, HiVolumeUp } from "react-icons/hi";
import { HiOutlineHome } from "react-icons/hi2";
import { ImWarning } from "react-icons/im";
import {
  IoIosArrowRoundForward,
  IoIosLogIn,
  IoIosNotificationsOutline,
  IoIosRefresh,
  IoIosSearch,
  IoMdArrowBack,
  IoMdArrowUp,
  IoMdCall,
  IoMdCheckmarkCircleOutline,
} from "react-icons/io";
import {
  IoCalendarNumberOutline,
  IoCallOutline,
  IoCheckmarkDoneOutline,
  IoClose,
  IoCloseSharp,
  IoEyeOffOutline,
  IoEyeOutline,
  IoLanguageSharp,
  IoLogInOutline,
  IoLogoTiktok,
  IoLogOutOutline,
  IoPersonCircleSharp,
  IoRefreshCircleSharp,
  IoTimeOutline,
  IoTrashOutline,
  IoVolumeMuteSharp
} from "react-icons/io5";
import {
  LiaAwardSolid,
  LiaStarOfLifeSolid,
  LiaSyncAltSolid,
} from "react-icons/lia";
import { LuMailOpen, LuVideo } from "react-icons/lu";
import {
  MdCallEnd,
  MdCallMissedOutgoing,
  MdCheck,
  MdExpandMore,
  MdFavoriteBorder,
  MdFilterList,
  MdKeyboardArrowDown,
  MdKeyboardVoice,
  MdLocalPrintshop,
  MdOutlineExpandLess,
  MdOutlineFavorite,
  MdOutlineFeedback,
  MdOutlineFileDownload,
  MdOutlineKeyboardArrowUp,
  MdOutlineMailOutline,
  MdOutlineMoneyOff,
  MdOutlinePersonalInjury,
  MdOutlineSecurity,
  MdStars,
  MdWifiCalling1,
  MdWifiCalling3,
} from "react-icons/md";
import {
  PiHandDepositDuotone,
  PiHandWithdrawDuotone,
  PiStethoscopeBold,
  PiUploadSimpleThin,
  PiUserCheckDuotone,
} from "react-icons/pi";
import { RiDoubleQuotesL, RiDoubleQuotesR, RiFeedbackLine, RiSave2Fill } from "react-icons/ri";
import { SiExpertsexchange, SiGoogledocs } from "react-icons/si";
import { TbArrowsExchange } from "react-icons/tb";
interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export const CallMissedIcon = (props: IconProps) => {
  return <MdCallMissedOutgoing {...props} />;
};
export const WarnIcon = (props: IconProps) => {
  return <ImWarning {...props} />;
};
export const WorkIcon = (props: IconProps) => {
  return <FcHome {...props} />;
};
export const KIPIcon = (props: IconProps) => {
  return <FaKipSign {...props} />;
};
export const UserCheckIcon = (props: IconProps) => {
  return <PiUserCheckDuotone {...props} />;
};
export const ExperienceIcon = (props: IconProps) => {
  return <FaBookOpenReader {...props} />;
};
export const CiStethoscopeIcon = (props: IconProps) => {
  return <PiStethoscopeBold {...props} />;
};
export const ExpertiseIcon = (props: IconProps) => {
  return <SiExpertsexchange {...props} />;
};
export const AllowDownIcon = (props: IconProps) => {
  return <FiArrowDownLeft {...props} />;
};
export const AllowUpIcon = (props: IconProps) => {
  return <IoMdArrowUp {...props} />;
};
export const DotThreeIcon = (props: IconProps) => {
  return <BsThreeDotsVertical {...props} />;
};
export const VideoCallIcon = (props: IconProps) => {
  return <LuVideo {...props} />;
};
export const WithdrawIcon = (props: IconProps) => {
  return <PiHandWithdrawDuotone {...props} />;
};

export const DepositIcon = (props: IconProps) => {
  return <PiHandDepositDuotone {...props} />;
};

export const UserIcon = (props: IconProps) => {
  return <FiUser {...props} />;
};

export const VoiceIcon = (props: IconProps) => {
  return <MdKeyboardVoice {...props} />;
};

export const DotIocon = (props: IconProps) => {
  return <GoDotFill {...props} />;
};
export const AsyncIcon = (props: IconProps) => {
  return <LiaSyncAltSolid {...props} />;
};
export const CallingEndIcon = (props: IconProps) => {
  return <FcEndCall {...props} />;
};
export const CallingStartIcon = (props: IconProps) => {
  return <MdWifiCalling1 {...props} />;
};
export const CallingIcon = (props: IconProps) => {
  return <MdWifiCalling3 {...props} />;
};
export const CallEndIcon = (props: IconProps) => {
  return <MdCallEnd {...props} />;
};
export const VolumeMuteIcon = (props: IconProps) => {
  return <IoVolumeMuteSharp {...props} />;
};
export const GoUnmuteIcon = (props: IconProps) => {
  return <HiVolumeUp {...props} />;
};
export const MinusIconIcon = (props: IconProps) => {
  return <FaMicrophone {...props} />;
};

export const MinusSlashIcon = (props: IconProps) => {
  return <FaMicrophoneSlash {...props} />;
};
export const DVideoIcon = (props: IconProps) => {
  return <FaVideoSlash {...props} />;
};
export const VideoIcon = (props: IconProps) => {
  return <FaVideo {...props} />;
};
export const FavoriteLinerIcon = (props: IconProps) => {
  return <MdOutlineFavorite {...props} />;
};
export const FavoriteBorderIcon = (props: IconProps) => {
  return <MdFavoriteBorder {...props} />;
};
export const ExpendLessIcon = (props: IconProps) => {
  return <MdOutlineExpandLess {...props} />;
};
export const ExpendMoreIcon = (props: IconProps) => {
  return <MdExpandMore {...props} />;
};
export const LoggedInIcon = (props: IconProps) => {
  return <IoIosLogIn {...props} />;
};
export const CloseIcon = (props: IconProps) => {
  return <IoCloseSharp {...props} />;
};
export const RegisterIcon = (props: IconProps) => {
  return <BsPersonPlus {...props} />;
};
export const LanguageIcon = (props: IconProps) => {
  return <IoLanguageSharp {...props} />;
};
export const GridIcon = (props: IconProps) => {
  return <BsFillGrid3X3GapFill {...props} />;
};
export const ListIcon = (props: IconProps) => {
  return <FaListUl {...props} />;
};
export const DollarOffIcon = (props: IconProps) => {
  return <MdOutlineMoneyOff {...props} />;
};
export const DollarIcon = (props: IconProps) => {
  return <FaDollarSign {...props} />;
};
export const PatientIcon = (props: IconProps) => {
  return <MdOutlinePersonalInjury {...props} />;
};
export const PrintIcon = (props: IconProps) => {
  return <MdLocalPrintshop {...props} />;
};
export const DownloadIcon = (props: IconProps) => {
  return <MdOutlineFileDownload {...props} />;
};
export const PDFIcon = (props: IconProps) => {
  return <AiFillFilePdf {...props} />;
};
export const QuotesIconL = (props: IconProps) => {
  return <RiDoubleQuotesL {...props} />;
};
export const QuotesIconR = (props: IconProps) => {
  return <RiDoubleQuotesR {...props} />;
};
export const FilterIcon = (props: IconProps) => {
  return <MdFilterList {...props} />;
};
export const ArrowUpIcon = (props: IconProps) => {
  return <MdOutlineKeyboardArrowUp {...props} />;
};
export const ArrowDownIcon = (props: IconProps) => {
  return <MdKeyboardArrowDown {...props} />;
};
export const PendingIcon = (props: IconProps) => {
  return <IoRefreshCircleSharp {...props} />;
};
export const TrendDownIcon = (props: IconProps) => {
  return <FaArrowTrendDown {...props} />;
};
export const TrendUpIcon = (props: IconProps) => {
  return <FaArrowTrendUp {...props} />;
};
export const PointIcon = (props: IconProps) => {
  return <MdStars {...props} />;
};
export const FeedBackIcon = (props: IconProps) => {
  return <MdOutlineFeedback {...props} />;
};
export const TimeIcon = (props: IconProps) => {
  return <IoTimeOutline {...props} />;
};

export const NextLinkIcon = (props: IconProps) => {
  return <GrFormNextLink {...props} />;
};

export const PreviousLinkIcon = (props: IconProps) => {
  return <GrFormPreviousLink {...props} />;
};
export const BankIcon = (props: IconProps) => {
  return <CiBank {...props} />;
};

export const CheckCircleIcon = (props: IconProps) => {
  return <IoMdCheckmarkCircleOutline {...props} />;
};
export const ProtectIcon = (props: IconProps) => {
  return <MdOutlineSecurity {...props} />;
};
export const EditIcon = (props: IconProps) => {
  return <CiEdit {...props} />;
};
export const SettingIcon = (props: IconProps) => {
  return <CiSettings {...props} />;
};
export const TrashIcon = (props: IconProps) => {
  return <IoTrashOutline {...props} />;
};
export const CircleIcon = (props: IconProps) => {
  return <GiCircle {...props} />;
};
export const WarningIcon = (props: IconProps) => {
  return <CiWarning {...props} />;
};
export const RefreshIcon = (props: IconProps) => {
  return <IoIosRefresh {...props} />;
};
export const UploadIcon = (props: IconProps) => {
  return <PiUploadSimpleThin {...props} />;
};
export const LockIcon = (props: IconProps) => {
  return <CiLock {...props} />;
};
export const LogoutIcon = (props: IconProps) => {
  return <IoLogOutOutline {...props} />;
};
export const CircleUser = (props: IconProps) => {
  return <IoPersonCircleSharp {...props} />;
};
export const OutlineHomeIcon = (props: IconProps) => {
  return <HiOutlineHome {...props} />;
};
export const TransactionIcon = (props: IconProps) => {
  return <TbArrowsExchange {...props} />;
};
export const LoginIcon = (props: IconProps) => {
  return <IoLogInOutline {...props} />;
};
export const BackIcon = (props: IconProps) => {
  return <IoMdArrowBack {...props} />;
};
export const AppleIcon = (props: IconProps) => {
  return <FaApple {...props} />;
};
export const GoogleIcon = (props: IconProps) => {
  return <FcGoogle {...props} />;
};
export const SaveIcon = (props: IconProps) => {
  return <RiSave2Fill {...props} />;
};
export const SquareMoreIcon = (props: IconProps) => {
  return <CiSquareMore {...props} />;
};

export const CheckIcon = (props: IconProps) => {
  return <MdCheck {...props} />;
};
export const DoubleCheckIcon = (props: IconProps) => {
  return <IoCheckmarkDoneOutline {...props} />;
};
export const FullStarIcon = (props: IconProps) => {
  return <FaStar {...props} />;
};
export const StarIcon = (props: IconProps) => {
  return <FaStarHalfAlt {...props} />;
};

export const AwardIcon = (props: IconProps) => {
  return <LiaAwardSolid {...props} />;
};
export const WorldIcon = (props: IconProps) => {
  return <BiWorld {...props} />;
};
export const UserPlusIcon = (props: IconProps) => {
  return <FaUserPlus {...props} />;
};
export const FeedbackIcon = (props: IconProps) => {
  return <RiFeedbackLine {...props} />;
};
export const HospitalIcon = (props: IconProps) => {
  return <GiHospitalCross {...props} />;
};
export const CalendarIcon = (props: IconProps) => {
  return <IoCalendarNumberOutline {...props} />;
};

export const NextIcon = (props: IconProps) => {
  return <GrFormNext {...props} />;
};
export const PrevIcon = (props: IconProps) => {
  return <GrFormPrevious {...props} />;
};
export const PlusIcon = (props: IconProps) => {
  return <GoPlus {...props} />;
};
export const HomeIcon = (props: IconProps) => {
  return <FaHome {...props} />;
};
export const DoctorIcon = (props: IconProps) => {
  return <FaUserDoctor {...props} />;
};
export const DocumentIcon = (props: IconProps) => {
  return <SiGoogledocs {...props} />;
};
export const CancelIcon = (props: IconProps) => {
  return <IoClose {...props} />;
};
export const MenuIcon = (props: IconProps) => {
  return <HiMenuAlt2 {...props} />;
};
export const NotiIcon = (props: IconProps) => {
  return <IoIosNotificationsOutline {...props} />;
};
export const CloseEyeIcon = (props: IconProps) => {
  return <IoEyeOutline {...props} />;
};
export const OpenEyeIcon = (props: IconProps) => {
  return <IoEyeOffOutline {...props} />;
};
export const EmailIcon = (props: IconProps) => {
  return <LuMailOpen {...props} />;
};
export const LocationIcon = (props: IconProps) => {
  return <FaMapMarkerAlt {...props} />;
};
export const FacebookIcon = (props: IconProps) => {
  return <FaFacebookF {...props} />;
};
export const TiktokIcon = (props: IconProps) => {
  return <IoLogoTiktok {...props} />;
};
export const LinkedInIcon = (props: IconProps) => {
  return <FaLinkedinIn {...props} />;
};
export const WhatsappIcon = (props: IconProps) => {
  return <FaWhatsapp {...props} />;
};
export const SearchIcon = (props: IconProps) => {
  return <IoIosSearch {...props} />;
};
export const ArrowNextIcon = (props: IconProps) => {
  return <IoIosArrowRoundForward {...props} />;
};
export const CallIcon = (props: IconProps) => {
  return <IoCallOutline {...props} />;
};

export const AboutIcon = (props: IconProps) => {
  return <BsFillExclamationDiamondFill {...props} />;
};

export const CallFullIcon = (props: IconProps) => {
  return <IoMdCall {...props} />;
};
export const YoutubeIcon = (props: IconProps) => {
  return <AiOutlineYoutube {...props} />;
};

export const CalculatorIcon = (props: IconProps) => {
  return <FaCalculator {...props} />;
};