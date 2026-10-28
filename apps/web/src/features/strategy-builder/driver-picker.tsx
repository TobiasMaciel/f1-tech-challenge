import type { DriverWithTeam } from '@f1/shared';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DriverPickerProps {
  drivers: DriverWithTeam[];
  selectedDriverId: string | null;
  onSelectDriver: (driverId: string) => void;
}

/** Drivers grouped by team name, keeping the order the API returned them in. */
function groupByTeam(drivers: DriverWithTeam[]) {
  const groups = new Map<string, DriverWithTeam[]>();
  for (const driver of drivers) {
    groups.set(driver.team.name, [...(groups.get(driver.team.name) ?? []), driver]);
  }
  return [...groups];
}

/** Driver select grouped by team. */
export function DriverPicker({ drivers, selectedDriverId, onSelectDriver }: DriverPickerProps) {
  // Lets the trigger show the driver's name instead of the raw id.
  const items = drivers.map((driver) => ({ value: driver.id, label: driver.name }));

  return (
    <Select
      items={items}
      value={selectedDriverId}
      onValueChange={(driverId) => driverId && onSelectDriver(driverId)}
    >
      <SelectTrigger aria-label="Piloto" className="w-full">
        <SelectValue placeholder="Elige un piloto" />
      </SelectTrigger>
      <SelectContent>
        {groupByTeam(drivers).map(([teamName, teamDrivers]) => (
          <SelectGroup key={teamName}>
            <SelectLabel>{teamName}</SelectLabel>
            {teamDrivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
