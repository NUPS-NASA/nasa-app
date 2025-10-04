type Props = React.ButtonHTMLAttributes<HTMLDivElement> & {
  title: string;
};

const ProfileSubContainer: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-[7px]">
      <div className="text-title16 h-[19px] w-full text-black">{title}</div>
      <div className="w-full h-fit">{children}</div>
    </div>
  );
};

export default ProfileSubContainer;
