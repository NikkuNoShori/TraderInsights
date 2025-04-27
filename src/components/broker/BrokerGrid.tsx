import { Brokerage } from "snaptrade-typescript-sdk";

interface BrokerGridProps {
  brokers: Brokerage[];
}

export function BrokerGrid({ brokers }: BrokerGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {brokers.map((broker) => (
        <div key={broker.id} className="p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            {broker.aws_s3_square_logo_url && (
              <img
                src={broker.aws_s3_square_logo_url}
                alt={broker.name}
                className="w-12 h-12 object-contain"
              />
            )}
            <div>
              <h3 className="font-medium">{broker.name}</h3>
              {broker.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {broker.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 