"use client";

import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BragBoardForm } from "@/components/brag-board-form";

interface BoatOption {
  id: number;
  name: string;
  cityName: string;
  stateCode: string;
}

interface SpeciesOption {
  id: number;
  name: string;
}

interface BragBoardFormDialogProps {
  boats: BoatOption[];
  speciesList: SpeciesOption[];
  preselectedBoatId?: number;
  children: React.ReactNode;
}

export function BragBoardFormDialog({
  boats,
  speciesList,
  preselectedBoatId,
  children,
}: BragBoardFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) setFormKey((k) => k + 1);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button type="button" />} className="cursor-pointer">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-display font-bold">
            <Camera className="h-5 w-5" />
            Submit Your Catch
          </DialogTitle>
          <DialogDescription>
            Share your best party boat fishing photo with the community
          </DialogDescription>
        </DialogHeader>
        <BragBoardForm
          key={formKey}
          boats={boats}
          speciesList={speciesList}
          preselectedBoatId={preselectedBoatId}
          inDialog
        />
      </DialogContent>
    </Dialog>
  );
}
