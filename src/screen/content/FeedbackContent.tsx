import { ExternalLink, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FeedbackContent = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Have Something in Mind?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Found a bug, have a suggestion, or want to request a new calculator?
            Fill out the feedback form and let us know.
          </p>
          <a
            href="https://forms.gle/3nRYqHGPTyXugfKT8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            DN Overview User Feedback Form
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackContent;
