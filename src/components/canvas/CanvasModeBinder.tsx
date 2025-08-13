import { useAppState } from '@/components/state-provider';
import { useSetMode } from '@/tools/useSetMode';

export default function CanvasModeBinder() {
    const { currentState } = useAppState();
    // hook reads stage/layer/sel/tr from context; you only pass mode
    useSetMode(currentState.mode);
    return null;
}
