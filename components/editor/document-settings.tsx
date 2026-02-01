'use client';

import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PDFMetadata, PDFTheme, PDFPageSettings } from '@/lib/pdf/schema';

interface DocumentSettingsProps {
  metadata: PDFMetadata;
  theme?: PDFTheme;
  pageSettings?: PDFPageSettings;
  onUpdateMetadata: (metadata: Partial<PDFMetadata>) => void;
  onUpdateTheme: (theme: Partial<PDFTheme>) => void;
  onUpdatePageSettings: (pageSettings: Partial<PDFPageSettings>) => void;
}

export function DocumentSettings({
  metadata,
  theme,
  pageSettings,
  onUpdateMetadata,
  onUpdateTheme,
  onUpdatePageSettings,
}: DocumentSettingsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 size-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Document Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="page">Page</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => onUpdateMetadata({ title: e.target.value })}
                placeholder="Enter document title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={metadata.author || ''}
                onChange={(e) => onUpdateMetadata({ author: e.target.value })}
                placeholder="Enter author name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={metadata.subject || ''}
                onChange={(e) => onUpdateMetadata({ subject: e.target.value })}
                placeholder="Enter document subject"
              />
            </div>
          </TabsContent>

          <TabsContent value="page" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Page Size</Label>
                <Select
                  value={pageSettings?.size || 'A4'}
                  onValueChange={(value) =>
                    onUpdatePageSettings({ size: value as 'A4' | 'LETTER' | 'LEGAL' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="LETTER">Letter</SelectItem>
                    <SelectItem value="LEGAL">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Orientation</Label>
                <Select
                  value={pageSettings?.orientation || 'portrait'}
                  onValueChange={(value) =>
                    onUpdatePageSettings({ orientation: value as 'portrait' | 'landscape' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Margins (px)</Label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Top</Label>
                  <Input
                    type="number"
                    value={pageSettings?.margins?.top ?? 40}
                    onChange={(e) =>
                      onUpdatePageSettings({
                        margins: {
                          ...pageSettings?.margins,
                          top: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Right</Label>
                  <Input
                    type="number"
                    value={pageSettings?.margins?.right ?? 40}
                    onChange={(e) =>
                      onUpdatePageSettings({
                        margins: {
                          ...pageSettings?.margins,
                          right: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bottom</Label>
                  <Input
                    type="number"
                    value={pageSettings?.margins?.bottom ?? 60}
                    onChange={(e) =>
                      onUpdatePageSettings({
                        margins: {
                          ...pageSettings?.margins,
                          bottom: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Left</Label>
                  <Input
                    type="number"
                    value={pageSettings?.margins?.left ?? 40}
                    onChange={(e) =>
                      onUpdatePageSettings({
                        margins: {
                          ...pageSettings?.margins,
                          left: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="h-9 w-12 p-1"
                    value={theme?.primaryColor || '#1a365d'}
                    onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                  />
                  <Input
                    value={theme?.primaryColor || '#1a365d'}
                    onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="h-9 w-12 p-1"
                    value={theme?.secondaryColor || '#2d3748'}
                    onChange={(e) => onUpdateTheme({ secondaryColor: e.target.value })}
                  />
                  <Input
                    value={theme?.secondaryColor || '#2d3748'}
                    onChange={(e) => onUpdateTheme({ secondaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="h-9 w-12 p-1"
                    value={theme?.accentColor || '#3182ce'}
                    onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
                  />
                  <Input
                    value={theme?.accentColor || '#3182ce'}
                    onChange={(e) => onUpdateTheme({ accentColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="h-9 w-12 p-1"
                    value={theme?.textColor || '#1a202c'}
                    onChange={(e) => onUpdateTheme({ textColor: e.target.value })}
                  />
                  <Input
                    value={theme?.textColor || '#1a202c'}
                    onChange={(e) => onUpdateTheme({ textColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
