// "use client";

// import SubmitButton from "@/components/buttons/submit-button";
// import ErrorMessages from "@/components/shared/error-messages";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { initialGenerateProgramFormState } from "@/lib/constants";
// import { useFormState } from "react-dom";
// import { generateProgram } from "./actions";
// import { useState } from "react";
// import { cn } from "@/lib/utils";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { CalendarIcon } from "@radix-ui/react-icons";
// import { format } from "date-fns";
// import { Label } from "@/components/ui/label";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// import { ProgramFormResponse } from "@/types/types";

// const numberOfSessions = [1, 2, 3, 4, 5, 6, 7];
// const prioritizeOptions = ["Conditioning", "Strength", "Flexibility"];
// const typeOptions = ["Running", "Cycling"];

// export default function Page() {
//   const [startDate, setStartDate] = useState<Date | undefined>(
//     formatDate(new Date())
//   );
//   const [prioritize, setPrioritize] = useState<string[]>([]);
//   const [types, setTypes] = useState<string[]>([]);
//   const [equipment, setEquipment] = useState<string[]>([]);
//   const [formState, formAction] = useFormState(
//     (formState: ProgramFormResponse, formData: any) => {
//       return generateProgram(
//         formState,
//         formData,
//         startDate,
//         prioritize,
//         types,
//         equipment
//       );
//     },
//     initialGenerateProgramFormState
//   );

//   function formatAndSetDate(date: Date | undefined) {
//     if (!date) {
//       setStartDate(undefined);
//       return;
//     }
//     date = formatDate(date);
//     setStartDate(date);
//   }

//   function formatDate(date: Date) {
//     const offset = date.getTimezoneOffset();
//     date = new Date(date.getTime() - offset * 60 * 1000);
//     return date;
//   }

//   const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value;
//     const equipmentArray = inputValue.split(",").map((item) => item.trim());
//     setEquipment(equipmentArray);
//   };

//   return (
//     <form action={formAction}>
//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle className="text-2xl">Personalize your program</CardTitle>
//           <CardDescription>
//             We will tailor your program to your needs based on the information
//             you provide below.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="grid gap-2">
//           <div className="mb-2">
//             <Label>Start date</Label>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant={"outline"}
//                   className={cn(
//                     "w-full justify-start text-left font-normal",
//                     !startDate && "text-muted-foreground"
//                   )}>
//                   <CalendarIcon className="mr-2" />
//                   {startDate ? (
//                     format(startDate, "PPP")
//                   ) : (
//                     <span>Pick a start date</span>
//                   )}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar
//                   mode="single"
//                   selected={startDate}
//                   onSelect={formatAndSetDate}
//                 />
//               </PopoverContent>
//             </Popover>
//             <ErrorMessages
//               name="startDate"
//               errors={formState && formState.errors}
//             />
//             <p className="text-sm mt-2 ml-2 text-muted-foreground">
//               On what date would you like the start program to start?
//             </p>
//           </div>
//           <div className="flex flex-col md:flex-row w-full gap-2">
//             <div className="mb-2 w-full md:w-1/2">
//               <Label htmlFor="sessions">Sessions per week</Label>
//               <Select defaultValue="3" name="sessions">
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {numberOfSessions.map((sessionNumber) => (
//                     <SelectItem
//                       key={sessionNumber}
//                       value={sessionNumber.toString()}>
//                       {sessionNumber.toString()}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <ErrorMessages
//                 name="sessions"
//                 errors={formState && formState.errors}
//               />
//             </div>
//             <div className="mb-2 w-full md:w-1/2">
//               <Label htmlFor="time">Session length (min)</Label>
//               <Input
//                 type="number"
//                 name="time"
//                 placeholder="Time"
//                 id="time"
//                 defaultValue="30"
//               />
//               <ErrorMessages
//                 name="time"
//                 errors={formState && formState.errors}
//               />
//             </div>
//           </div>
//           <div className="mb-2">
//             <Label>Prioritize</Label>
//             <ToggleGroup
//               variant="outline"
//               type="multiple"
//               className="justify-start"
//               value={prioritize}
//               onValueChange={(value) => {
//                 if (value) setPrioritize(value);
//               }}>
//               {prioritizeOptions.map((prio) => (
//                 <ToggleGroupItem
//                   key={prio}
//                   value={prio}
//                   aria-label={`Toggle ${prio}`}>
//                   {prio}
//                 </ToggleGroupItem>
//               ))}
//             </ToggleGroup>
//             <ErrorMessages
//               name="prioritize"
//               errors={formState && formState.errors}
//             />
//             <p className="text-sm mt-2 ml-2 text-muted-foreground">
//               Leave empty to get an all-round program.
//             </p>
//           </div>
//           <div className="mb-2">
//             <Label>Include</Label>
//             <ToggleGroup
//               variant="outline"
//               type="multiple"
//               className="justify-start"
//               value={types}
//               onValueChange={(value) => {
//                 if (value) setTypes(value);
//               }}>
//               {typeOptions.map((type) => (
//                 <ToggleGroupItem
//                   key={type}
//                   value={type}
//                   aria-label={`Toggle ${type}`}>
//                   {type}
//                 </ToggleGroupItem>
//               ))}
//             </ToggleGroup>
//             <ErrorMessages
//               name="types"
//               errors={formState && formState.errors}
//             />
//           </div>
//           <div className="mb-2">
//             <Label htmlFor="equipment">Equipment</Label>
//             <Input
//               id="equipment"
//               name="equipment"
//               placeholder="Kettlebell, dumbbell, etc."
//               type="equipment"
//               onChange={handleEquipmentChange}
//             />
//             <ErrorMessages name="equipment" errors={formState.errors} />
//             <p className="text-sm mt-2 ml-2 text-muted-foreground">
//               Specify any kind of equipment you have available separated by a
//               commas.
//             </p>
//           </div>
//         </CardContent>
//         <CardFooter>
//           <SubmitButton content="Generate" classes="w-full" />
//         </CardFooter>
//       </Card>
//     </form>
//   );
// }

// const test = {
//   startDate: "2024-05-26",
//   endDate: "2024-06-01",
//   workouts: [
//     {
//       date: "2024-05-26",
//       completed: false,
//       description: "Conditioning Workout with Kettlebell and Jump Rope.",
//       warmup: {
//         description: "Warm-up to get the heart rate up and muscles ready.",
//         duration: 10,
//         exercises: [
//           {
//             title: "Jumping Jacks",
//             description: "Perform Jumping Jacks.",
//             amount: { sets: 1, reps: 50 },
//           },
//           {
//             title: "Arm Circles",
//             description: "Perform Arm Circles to warm up shoulders.",
//             amount: { sets: 1, reps: 15 },
//           },
//           {
//             title: "Bodyweight Squats",
//             description: "Perform Bodyweight Squats to warm up legs.",
//             amount: { sets: 1, reps: 20 },
//           },
//         ],
//       },
//       exercises: [
//         {
//           title: "Kettlebell Swings",
//           description: "Perform Kettlebell Swings.",
//           amount: { sets: 3, reps: 20 },
//           restPeriod: 60,
//         },
//         {
//           title: "Jump Rope Intervals",
//           description:
//             "Jump rope as fast as possible for 1 minute, then rest for 30 seconds.",
//           amount: { sets: 5, reps: 1 },
//           restPeriod: 30,
//         },
//         {
//           title: "Kettlebell Goblet Squats",
//           description: "Perform Goblet Squats with a Kettlebell.",
//           amount: { sets: 3, reps: 15 },
//           restPeriod: 60,
//         },
//         {
//           title: "Push-Ups",
//           description: "Perform Push-Ups.",
//           amount: { sets: 3, reps: 12 },
//           restPeriod: 60,
//         },
//       ],
//     },
//     {
//       date: "2024-05-28",
//       completed: false,
//       description: "Strength and Conditioning Workout with Dumbbells.",
//       warmup: {
//         description: "Warm-up to prep muscles for strength exercises.",
//         duration: 10,
//         exercises: [
//           {
//             title: "Jump Rope",
//             description: "Jump Rope for warm-up.",
//             amount: { sets: 1, reps: 200 },
//           },
//           {
//             title: "Leg Swings",
//             description: "Perform Leg Swings to warm up hips.",
//             amount: { sets: 1, reps: 15 },
//           },
//           {
//             title: "Torso Twists",
//             description: "Perform Torso Twists to warm up core.",
//             amount: { sets: 1, reps: 20 },
//           },
//         ],
//       },
//       exercises: [
//         {
//           title: "Dumbbell Thrusters",
//           description: "Perform Thrusters with Dumbbells.",
//           amount: { sets: 3, reps: 12 },
//           restPeriod: 60,
//         },
//         {
//           title: "Renegade Rows",
//           description: "Perform Renegade Rows with Dumbbells.",
//           amount: { sets: 3, reps: 10 },
//           restPeriod: 60,
//         },
//         {
//           title: "Dumbbell Deadlifts",
//           description: "Perform Deadlifts with Dumbbells.",
//           amount: { sets: 3, reps: 15 },
//           restPeriod: 60,
//         },
//         {
//           title: "Mountain Climbers",
//           description: "Perform Mountain Climbers.",
//           amount: { sets: 4, reps: 30 },
//           restPeriod: 30,
//         },
//         {
//           title: "Dumbbell Chest Press",
//           description: "Perform Chest Press with Dumbbells.",
//           amount: { sets: 3, reps: 12 },
//           restPeriod: 60,
//         },
//       ],
//     },
//     {
//       date: "2024-05-30",
//       completed: false,
//       description: "Conditioning Workout with Cycling.",
//       warmup: {
//         description: "Warm-up focusing on the lower body.",
//         duration: 10,
//         exercises: [
//           {
//             title: "High Knees",
//             description: "Perform High Knees to warm up legs.",
//             amount: { sets: 1, reps: 40 },
//           },
//           {
//             title: "Hip Circles",
//             description: "Perform Hip Circles to warm up hip joints.",
//             amount: { sets: 1, reps: 12 },
//           },
//           {
//             title: "Forward Lunges",
//             description: "Perform Forward Lunges to warm up legs.",
//             amount: { sets: 1, reps: 12 },
//           },
//         ],
//       },
//       exercises: [
//         {
//           title: "Cycling",
//           description: "Cycling at a moderate pace.",
//           amount: { sets: 1, reps: 30 },
//           restPeriod: 0,
//         },
//         {
//           title: "Burpees",
//           description: "Perform Burpees.",
//           amount: { sets: 3, reps: 15 },
//           restPeriod: 60,
//         },
//         {
//           title: "Plank",
//           description: "Hold a Plank position.",
//           amount: { sets: 3, reps: 60 },
//           restPeriod: 60,
//         },
//         {
//           title: "Jumping Squats",
//           description: "Perform Jumping Squats.",
//           amount: { sets: 3, reps: 15 },
//           restPeriod: 60,
//         },
//       ],
//     },
//   ],
// };
