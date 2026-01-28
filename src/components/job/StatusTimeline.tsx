import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { timelineSteps } from '@/constants';

interface StatusTimelineProps {
  currentStep: number;
}

export function StatusTimeline({ currentStep }: StatusTimelineProps) {
  return (
    <div className="section-card">
      <h3 className="text-sm font-medium text-muted-foreground mb-6">Job Progress</h3>
      <div className="relative">
        <div className="flex justify-between items-center">
          {timelineSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div key={step} className="timeline-step flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 z-10 relative bg-card',
                    isCompleted && 'bg-success border-success text-success-foreground',
                    isCurrent && 'bg-primary border-primary text-primary-foreground',
                    isPending && 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 text-center block',
                    isCompleted && 'text-success font-medium',
                    isCurrent && 'text-primary font-semibold',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
                {index < timelineSteps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2',
                      isCompleted ? 'bg-success' : 'bg-muted'
                    )}
                    style={{ zIndex: 0 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
