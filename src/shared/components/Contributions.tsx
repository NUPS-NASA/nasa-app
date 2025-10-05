import ContributionCalendar from './ContributionCalendar';
import Tile from './Tile';

const Contributions: React.FC = () => {
  return (
    <Tile variant="card">
      <div className="">
        <div className="text-title12 mb-[10px]">contribution dot</div>
        <ContributionCalendar></ContributionCalendar>
        <div>
          <div className="text-title12 h-[14px] mb-[11px]">
            uploads in the Equatorial Coordinate Star Chart
          </div>
          <img src="/images/map.png" className="w-full h-[220px]" />
        </div>
      </div>
    </Tile>
  );
};

export default Contributions;
