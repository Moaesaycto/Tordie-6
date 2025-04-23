import { useStatus } from "@/components/status-provider";

import AppleIcon from '@/assets/icons/os/apple-icon.svg?react';
import WindowsIcon from '@/assets/icons/os/windows-icon.svg?react';
import LinuxIcon from '@/assets/icons/os/linux-icon.svg?react';
import OtherIcon from '@/assets/icons/os/other-icon.svg?react';
import { useTheme } from "@/components/theme-provider";

const OSIcons: Record<string, React.ElementType> = {
    macos: AppleIcon,
    windows: WindowsIcon,
    linux: LinuxIcon,
};

const StatusDisplay = () => {
    const { os } = useStatus();
    const { resolvedTheme } = useTheme();

    const Icon = OSIcons[os as string] || OtherIcon;

    const displayColor = resolvedTheme === 'dark' ? 'text-black' : 'text-white';
    const opposite = resolvedTheme === 'dark' ? 'bg-white' : 'bg-black';

    return (
        <div
            className={`
                ${displayColor} ${opposite}
                flex flex-col items-center justify-center
                h-full w-full
                px-1 py-1
            `}
        >
            <Icon className="w-3 h-auto" />
            <span className="text-[0.625rem]">{os ? os.toUpperCase() : 'UNKNOWN'}</span>
        </div>
    );
};


export default StatusDisplay;
