import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Is It Dumb</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="trending">Trending Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Which model are you checking on?" />
                <CommandList>
                  <CommandEmpty>No models found.</CommandEmpty>
                  <CommandGroup heading="OpenAI">
                    <CommandItem>
                      <span className="ml-4 text-sm">GPT-4</span>
                    </CommandItem>
                    <CommandItem>
                      <span className="ml-4 text-sm">GPT-4 Turbo</span>
                    </CommandItem>
                    <CommandItem>
                      <span className="ml-4 text-sm">GPT-3.5 Turbo</span>
                    </CommandItem>
                    <CommandItem>
                      <span className="ml-4 text-sm">ChatGPT</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Anthropic">
                    <CommandItem>
                      <span className="ml-4 text-sm">Claude 3.5 Sonnet</span>
                    </CommandItem>
                    <CommandItem>
                      <span className="ml-4 text-sm">Claude 3 Opus</span>
                    </CommandItem>
                    <CommandItem>
                      <span className="ml-4 text-sm">Claude 3 Haiku</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Google">
                    <CommandItem>
                      <span className="ml-4 text-sm">Gemini Pro</span>
                    </CommandItem>
                    <CommandItem>
                      <span className="ml-4 text-sm">Gemini Ultra</span>
                    </CommandItem>
                    <CommandItem>
                      <span className="ml-4 text-sm">PaLM 2</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandGroup heading="Meta">
                    <CommandItem>
                      <span className="ml-4 text-sm">Llama 3.1</span>
                    </CommandItem>
                    <CommandItem>
                      <span className="ml-4 text-sm">Llama 2</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
              
              <div className="space-y-4">
                <Textarea 
                  placeholder="Optional: Briefly describe the issue..."
                  className="min-h-[100px]"
                />
                <Button size="lg" className="w-full">
                  Check Model
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trending" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Top Reported Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Issue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Charts coming soon...</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Trending Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Clustering analysis coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
