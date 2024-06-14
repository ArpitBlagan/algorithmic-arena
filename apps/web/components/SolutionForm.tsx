"use client";
import { SolutionInput } from "@repo/common/zod";
import { Input } from "@repo/ui/input";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Textarea } from "@repo/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown";
import { useEffect, useState } from "react";
import { LANGUAGE_MAPPING } from "@repo/common/language";
import { Button } from "@repo/ui/button";
import { Label } from "@repo/ui/label";
import { toast } from "react-toastify";

interface propss {
  type: string;
  title: string;
  explaination: string;
  code: string;
  problemId: string;
  languageId: any;
}
const SolutionForm = ({ type, problem }: any) => {
  const [submission, setSubmissions] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [explaination, setExplaintation] = useState("");
  const [subId, setSubId] = useState(null);
  const [language, setLanguage] = useState(
    Object.keys(LANGUAGE_MAPPING)[0] as string
  );
  const [code, setCode] = useState<Record<string, string>>({});
  const handleClick = async () => {
    const body = {
      title,
      explaination,
      problemId: "",
      languageId: "",
      code: code[language],
    };
    const result = SolutionInput.safeParse(body);
    if (!result.success) {
      toast.error("fill all the fileds before submitting");
      return;
    }
    try {
      if (type == "add") {
        const res = await axios.post("/api/solution", body);
        toast.success("solution added successfully");
      } else {
      }
    } catch (err) {
      console.log(err);
      toast.error("something went wrong");
    }
  };
  useEffect(() => {
    const defaultCode: { [key: string]: string } = {};
    problem.defaultCode.forEach((code: any) => {
      const language = Object.keys(LANGUAGE_MAPPING).find(
        (language) => LANGUAGE_MAPPING[language]?.internal === code.languageId
      );
      if (!language) return;
      defaultCode[language] = code.code;
    });
    setCode(defaultCode);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/submission/bulk?problemId=${""}`);
      setSubmissions(response.data.submissions || []);
    };
    //fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("api/sbumission/:${subId}");
      setCode({
        ...code,
        [response.data.submission.language]: response.data.submission.code,
      });
      setLanguage(response.data.submission.language);
    };
    if (subId) {
      fetchData();
    }
  }, [subId]);
  return (
    <div className="my-2">
      <form className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <label>Title</label>
          <Input
            required={true}
            type="text"
            placeholder="Easy to understand c++ sol."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <label>Explaination</label>
          <Textarea
            placeholder="Simply use sort build-in function."
            className="h-[150px]"
            value={explaination}
            onChange={(e) => {
              setExplaintation(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>Select Submission</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select a submission id</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {submission.map((sub) => {
                  if (sub.status == "AC") {
                    return (
                      <DropdownMenuItem
                        onClick={() => {
                          setSubId(sub.id);
                        }}
                      >
                        {sub.id.subset(0, 8)}
                      </DropdownMenuItem>
                    );
                  }
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <label>Code</label>
          <Label htmlFor="language">Language</Label>
          <Select
            value={language}
            defaultValue="cpp"
            onValueChange={(value) => setLanguage(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(LANGUAGE_MAPPING).map((language) => (
                <SelectItem key={language} value={language}>
                  {LANGUAGE_MAPPING[language]?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="pt-4 rounded-md">
            <Editor
              height={"60vh"}
              value={code[language]}
              theme="vs-dark"
              onMount={() => {}}
              options={{
                fontSize: 14,
                scrollBeyondLastLine: false,
              }}
              language={LANGUAGE_MAPPING[language]?.monaco}
              onChange={(value) => {
                //@ts-ignore
                setCode({ ...code, [language]: value });
              }}
              defaultLanguage="cpp"
            />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            variant={"default"}
            onClick={(e) => {
              e.preventDefault();
              handleClick();
            }}
            className="w-1/4"
          >
            {type == "update" ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SolutionForm;
