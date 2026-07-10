import { AppLayout } from "@/components/layout/AppLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const integrationSchema = z.object({
  webhookUrl: z.string().url({ message: "Please enter a valid URL." }).or(z.literal("")),
  apiKey: z.string().min(8, { message: "API Key must be at least 8 characters long." }).or(z.literal("")),
  autoSync: z.boolean(),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

const Integration = () => {
  const { add: toast } = useToast();
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      webhookUrl: "",
      apiKey: "",
      autoSync: false,
    },
  });

  const onSubmit = (data: IntegrationFormValues) => {
    toast({
      title: "Settings Saved",
      description: "Integration settings have been successfully updated.",
    });
    console.log("Integration Data:", data);
  };

  return (
    <AppLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Integrations
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Connect with third-party services and manage API endpoints.
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card p-6 md:p-8 rounded-xl shadow-lg border border-border/50 max-w-2xl"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input 
              id="webhookUrl" 
              placeholder="https://api.example.com/webhook" 
              {...form.register("webhookUrl")}
              className={form.formState.errors.webhookUrl ? "border-red-500" : ""}
            />
            {form.formState.errors.webhookUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.webhookUrl.message}</p>
            )}
            <p className="text-sm text-muted-foreground">Receive real-time alerts at this endpoint.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
              id="apiKey" 
              type="password"
              placeholder="Enter your secret API key" 
              {...form.register("apiKey")}
              className={form.formState.errors.apiKey ? "border-red-500" : ""}
            />
            {form.formState.errors.apiKey && (
              <p className="text-sm text-red-500">{form.formState.errors.apiKey.message}</p>
            )}
            <p className="text-sm text-muted-foreground">Keep this key secure and do not share it.</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="autoSync" className="text-base">Automatic Sync</Label>
              <p className="text-sm text-muted-foreground">
                Sync machine states automatically every 5 minutes.
              </p>
            </div>
            <Switch
              id="autoSync"
              checked={form.watch("autoSync")}
              onCheckedChange={(val) => form.setValue("autoSync", val)}
            />
          </div>

          <Button type="submit" className="w-full sm:w-auto mt-4" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </motion.div>
    </AppLayout>
  );
};

export default Integration;