import { useState } from 'react';
import { container, InjectionToken } from 'tsyringe';

// Hook to inject tsyringe services
export function useService<T>(token: InjectionToken<T>, init?: (svc: T) => void): T {
    const [service, setService] = useState<T>();
    if (!service) {
        const newService = container.resolve(token);
        init?.(newService);
        setService(newService);
    }
    return service!;
}
