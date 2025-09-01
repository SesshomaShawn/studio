"use client";

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, X, Loader2, Video, VideoOff } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { saveImage } from '@/lib/actions';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (!isCameraOpen) {
          if (videoRef.current?.srcObject) {
              const currentStream = videoRef.current.srcObject as MediaStream;
              currentStream.getTracks().forEach(track => track.stop());
              videoRef.current.srcObject = null;
          }
          return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraOpen, toast]);
  

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        toast({
            variant: "destructive",
            title: "File too large",
            description: "Please select an image smaller than 4MB.",
        });
        return;
    }

    setIsUploading(true);
    try {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            const savedUrl = await saveImage(base64String);
            onChange(savedUrl);
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error("Error saving image:", error);
        toast({
            variant: "destructive",
            title: "Upload failed",
            description: "Could not save the image. Please try again.",
        });
    } finally {
        setIsUploading(false);
    }
  };

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        
        setIsUploading(true);
        try {
            const savedUrl = await saveImage(dataUrl);
            onChange(savedUrl);
            setCameraOpen(false);
        } catch (error) {
             console.error("Error saving image:", error);
            toast({
                variant: "destructive",
                title: "Capture failed",
                description: "Could not save the captured image. Please try again.",
            });
        } finally {
            setIsUploading(false);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {value && (
        <div className="relative w-full h-48 rounded-md overflow-hidden">
          <Image src={value} alt="Product image" layout="fill" objectFit="cover" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7">
                    <X className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Remove Image?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will remove the current product image. You can upload a new one.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onChange('')}>Remove</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
           </AlertDialog>
        </div>
      )}

      {isUploading && (
          <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-md">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p>Uploading...</p>
          </div>
      )}

      {!value && !isUploading && (
         <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" onClick={() => setCameraOpen(false)}>
                    <ImageIcon className="mr-2 h-4 w-4" /> Upload
                </TabsTrigger>
                <TabsTrigger value="camera" onClick={() => setCameraOpen(true)}>
                    <Camera className="mr-2 h-4 w-4" /> Camera
                </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
                 <div 
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                    />
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Click or tap to select an image</p>
                    <p className="text-xs text-muted-foreground">(Max 4MB)</p>
                </div>
            </TabsContent>
            <TabsContent value="camera">
                <div className="flex flex-col items-center gap-4">
                     <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        <canvas ref={canvasRef} className="hidden" />
                         {hasCameraPermission === false && (
                            <div className='flex flex-col items-center text-destructive'>
                                <VideoOff className="h-10 w-10" />
                                <p>Camera not available</p>
                            </div>
                        )}
                         {hasCameraPermission === null && (
                            <div className='flex flex-col items-center text-muted-foreground'>
                                <Loader2 className="h-10 w-10 animate-spin" />
                                <p>Starting camera...</p>
                            </div>
                        )}
                    </div>
                     {hasCameraPermission === false && (
                         <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature. You may need to change permissions in your browser settings.
                            </AlertDescription>
                        </Alert>
                     )}
                     <Button onClick={handleCapture} disabled={!hasCameraPermission || isUploading} className="w-full">
                        <Camera className="mr-2 h-4 w-4" /> Capture Photo
                    </Button>
                </div>
            </TabsContent>
        </Tabs>
      )}
    </div>
  );
}