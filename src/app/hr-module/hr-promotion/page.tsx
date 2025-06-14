"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import toast, { Toaster } from "react-hot-toast";
import AppModuleLayout from "../../components/AppModuleLayout";
import DepartmentTree from "../../components/DepartmentTree";
import { fetchICFs } from "../../pages/api/icfService";

type TransferType = "To Department" | "From Department" | "";

function HrPromotion() {
  const [employeeName, setEmployeeName] = useState("");
  const [gender, setGender] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hiredDate, setHiredDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [icf, seticf] = useState("");
  const [icfDropdown, setIcfDropdown] = useState("");
  const [directorate, setDirectorate] = useState("");
  const [transferType, setTransferType] = useState<TransferType>("");
  const [toDepartment, setToDepartment] = useState("");
  const [fromDepartment, setFromDepartment] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [requestDate, setRequestDate] = useState("2017-09-15");
  const [selectedRequest, setSelectedRequest] = useState("");
  const [showDepartmentTreeModal, setShowDepartmentTreeModal] = useState(false);
  const [departments, setDepartments] = useState<
    { deptId: number; deptName: string }[]
  >([]);
  const [departmentFieldBeingEdited, setDepartmentFieldBeingEdited] = useState<
    "to" | "from" | "main" | null
  >(null);
  const [jobPositionId, setJobPositionId] = useState("");
  const [fromDepartmentId, setFromDepartmentId] = useState("");
  const [toDepartmentId, setToDepartmentId] = useState("");
  const [payGradeId, setPayGradeId] = useState("");
  const [jobResponsibilityId, setJobResponsibilityId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branchFromId, setBranchFromId] = useState("");
  const [jobCodeId, setJobCodeId] = useState("");
  const [transferRequests, setTransferRequests] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [approverDecision, setApproverDecision] = useState("");
  const [incrementStep, setIncrementStep] = useState("");
  const [selectedIncrementStep, setSelectedIncrementStep] = useState("");
  const [division, setDivision] = useState("");
  const [branch, setBranch] = useState("");
  const [jobResponsibility, setJobResponsibility] = useState("");
  const [refNo, setRefNo] = useState("");
  const [remark, setRemark] = useState("");
  const [progressBy, setProgressBy] = useState("Abdi Tolesa");
  const [loading, setLoading] = useState(true);
  const [branchNameTo, setBranchNameTo] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [jobClass, setJobClass] = useState("");
  const [changeTo, setChangeTo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [jobResponsibilities, setJobResponsibilities] = useState<
    {
      id: string;
      responsibility: string;
    }[]
  >([]);
  const [branches, setBranches] = useState<
    { id: number; branchName: string }[]
  >([]);
  const [jobTitles, setJobTitles] = useState<
    { id: number; jobTitle: string }[]
  >([]);
  const [incrementSteps, setIncrementSteps] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [empId, setEmpId] = useState("");
  const [icfList, setIcfList] = useState<string[]>([]);
  const employeeInfoRef = useRef<any>(null);

  const clearForm = () => {
    setEmployeeName("");
    setGender("");
    setJobPosition("");
    setHiredDate("");
    setEmployeeId("");
    setDepartment("");
    seticf("");
    setDirectorate("");
    setTransferType("");
    setToDepartment("");
    setFromDepartment("");
    setTransferReason("");
    setRequestDate("2017-09-15");
    setSelectedRequest("");
    setJobPositionId("");
    setFromDepartmentId("");
    setToDepartmentId("");
    setPayGradeId("");
    setJobResponsibilityId("");
    setBranchId("");
    setJobCodeId("");
    setSearchValue("");
    setApproverDecision("");
    setRemark("");
    employeeInfoRef.current = null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usedBranchId =
      branchId ||
      (branches.find((b) => b.branchName === branch)
        ? branches.find((b) => b.branchName === branch)?.id?.toString()
        : "");
    const usedJobResponsibility = jobResponsibilityId
      ? jobResponsibilities.find((j) => j.id === jobResponsibilityId)
          ?.responsibility || jobResponsibility
      : jobResponsibility;
    const usedToDepartmentId =
      toDepartmentId ||
      departments
        .find((d) => d.deptName === toDepartment)
        ?.deptId?.toString() ||
      "";
    const usedFromDepartmentId =
      fromDepartmentId ||
      departments
        .find((d) => d.deptName === fromDepartment)
        ?.deptId?.toString() ||
      "";
    const usedBranchFrom =
      branchFromId ||
      branches.find((b) => b.branchName === branchNameTo)?.id?.toString() ||
      "";

    let usedStatus = employeeInfoRef.current?.status;
    if (!usedStatus) usedStatus = status;
    if (!usedStatus && selectedRequest) {
      const req = transferRequests.find(
        (r) => r.transferRequesterId.toString() === selectedRequest
      );
      if (req && req.status) usedStatus = req.status;
    }
    const selectedJobTitle = jobTitles.find((jt) => jt.jobTitle === jobTitle);
    const jobTitleChanged = selectedJobTitle ? selectedJobTitle.id : undefined;

    const payload: any = {
      branchId: usedBranchId ? Number(usedBranchId) : undefined,
      branchFrom: usedBranchFrom ? Number(usedBranchFrom) : undefined,
      jobResponsibility: usedJobResponsibility,
      deptTransferTo: usedToDepartmentId
        ? Number(usedToDepartmentId)
        : undefined,
      prevDepartmentId: usedFromDepartmentId
        ? Number(usedFromDepartmentId)
        : undefined,
      prevJobPosition: jobPosition,
      employeeId,
      jobTitleChanged:
        jobTitleChanged !== undefined ? Number(jobTitleChanged) : undefined,
    };
    if (usedStatus && usedStatus !== "") {
      payload.status = usedStatus;
    }

    console.log("Submitting promotion history payload:", payload);

    fetch("http://localhost:8080/api/promotion-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save promotion history");
        return res.json();
      })
      .then(() => {
        toast.success("Promotion history saved successfully!");
        clearForm();
      })
      .catch(() => toast.error("Failed to save promotion history"));
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/departments")
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data);
      })
      .catch((err) => console.error("Failed to fetch departments", err));
  }, []);

  // Fetch employee info when employeeId changes
  useEffect(() => {
    if (employeeId.trim() !== "") {
      fetch(`http://localhost:8080/api/employees/${employeeId}/info`)
        .then((res) => {
          if (!res.ok) throw new Error("Employee not found");
          return res.json();
        })
        .then((data) => {
          employeeInfoRef.current = data;
          setEmployeeName(data.employeeName || "");
          setGender(data.gender || "");
          setHiredDate(data.hiredDate || "");
          setDepartment(data.departmentName || "");
          setDivision(data.departmentName || "");
          setFromDepartment(data.departmentName || "");
          setJobPosition(data.jobPosition || "");
          setDirectorate(data.directorateName || "");
          setJobPositionId(data.jobPositionId || "");
          setFromDepartmentId(data.fromDepartmentId || "");
          setToDepartmentId(data.toDepartmentId ?? "");
          setPayGradeId(data.payGradeId || "");
          setJobResponsibilityId(data.jobResponsibilityId || "");
          setJobResponsibility(data.jobResponsibility || "");
          setBranchId(data.branchId || "");
          setJobCodeId(data.jobCode || "");
          setCurrentSalary(data.currentSalary || "");
          setStatus(data.status || "");
          setEmpId(data.empId || "");
          setBranchFromId(data.branchId ? data.branchId.toString() : "");
          if (data.jobPositionId) {
            fetch(
              `http://localhost:8080/api/job-type-details/${data.jobPositionId}`
            )
              .then((res) => (res.ok ? res.json() : null))
              .then((jobTypeDetail) => {
                const icfValue =
                  jobTypeDetail && jobTypeDetail.icf && jobTypeDetail.icf.ICF
                    ? jobTypeDetail.icf.ICF
                    : "";
                seticf(icfValue);
                setIcfDropdown(icfList.includes(icfValue) ? icfValue : "");
                let jobClassValue = "";
                let jobGradeId = "";
                if (
                  jobTypeDetail &&
                  jobTypeDetail.jobType &&
                  jobTypeDetail.jobType.jobGrade
                ) {
                  jobClassValue = jobTypeDetail.jobType.jobGrade.grade;
                  jobGradeId = jobTypeDetail.jobType.jobGrade.id || "";
                }
                setJobClass(jobClassValue);

                if (data.payGradeId) {
                  fetch(
                    `http://localhost:8080/api/hr-pay-grad/${data.payGradeId}`
                  )
                    .then((res) => (res.ok ? res.json() : null))
                    .then((payGradeData) => {
                      const stepNo =
                        payGradeData && payGradeData.stepNo
                          ? payGradeData.stepNo
                          : "";
                      setIncrementStep(stepNo);
                      // Log all fetched employee info
                      console.log("Fetched employee info:", {
                        employeeName: data.employeeName,
                        gender: data.gender,
                        hiredDate: data.hiredDate,
                        departmentName: data.departmentName,
                        jobPosition: data.jobPosition,
                        directorateName: data.directorateName,
                        jobPositionId: data.jobPositionId,
                        fromDepartmentId: data.fromDepartmentId,
                        toDepartmentId: data.toDepartmentId ?? "",
                        payGradeId: data.payGradeId,
                        jobResponsibilityId: data.jobResponsibilityId,
                        jobResponsibility: data.jobResponsibility,
                        branchId: data.branchId,
                        branchFrom: data.branchId,
                        jobCode: data.jobCode,
                        icf: icfValue,
                        incrementStep: stepNo,
                        jobClass: jobClassValue,
                        jobGradeId: jobGradeId,
                        status,
                        empId,
                      });
                    });
                } else {
                  setIncrementStep("");
                }
              });
          }
        })
        .catch(() => {
          setEmployeeName("");
          setGender("");
          setHiredDate("");
          seticf("");
          setDepartment("");
          setFromDepartment("");
          setJobPosition("");
          setDirectorate("");
          setJobPositionId("");
          setFromDepartmentId("");
          setPayGradeId("");
          setJobResponsibilityId("");
          setBranchId("");
          setJobCodeId("");
        });
    } else {
      setEmployeeName("");
      setGender("");
      setHiredDate("");
      seticf("");
      setDepartment("");
      setFromDepartment("");
      setJobPosition("");
      setDirectorate("");
      setJobPositionId("");
      setFromDepartmentId("");
      setPayGradeId("");
      setJobResponsibilityId("");
      setBranchId("");
      setJobCodeId("");
    }
  }, [employeeId]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/hr-transfer-requests"
        );
        const data = await response.json();
        const filtered = data.filter((req: any) => {
          if (req.status === undefined || req.status === null) return false;
          return req.status === "2" || req.status === 2;
        });
        setTransferRequests(filtered);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);
  useEffect(() => {
    if (selectedRequest) {
      const req = transferRequests.find(
        (r) => r.transferRequesterId.toString() === selectedRequest
      );
      if (req && req.employee) {
        setEmployeeId(req.employee.empId || "");
        setEmployeeName(
          [
            req.employee.firstName,
            req.employee.middleName,
            req.employee.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        );
        setGender(req.employee.sex || "");
        setHiredDate(req.employee.hiredDate || "");
        const icfValue =
          req.employee.icf?.icfName || req.employee.icf?.ICF || "";
        seticf(icfValue);
        setIcfDropdown(icfValue);
        setDepartment(req.employee.department?.depName || "");
        setFromDepartment(req.employee.department?.depName || "");
        setJobPosition(
          req.employee.jobTypeDetail?.jobType?.jobTitle?.jobTitle || ""
        );
        setJobTitle(
          req.employee.jobTypeDetail?.jobType?.jobTitle?.jobTitle || ""
        );
        setDirectorate(req.employee.department?.directorateName || "");
        setJobPositionId(req.employee.jobTypeDetail?.id?.toString() || "");
        setFromDepartmentId(req.employee.department?.deptId?.toString() || "");
        setPayGradeId(req.employee.payGrade?.payGradeId?.toString() || "");
        setJobResponsibilityId(
          req.employee.jobResponsibility?.id?.toString() || ""
        );
        const foundResp = jobResponsibilities.find(
          (j) =>
            j.id.toString() ===
            (req.employee.jobResponsibility?.id?.toString() || "")
        );
        setJobResponsibility(foundResp ? foundResp.responsibility : "");
        setBranchId(req.employee.branch?.id?.toString() || "");
        setBranch(req.employee.branch?.branchName || "");
        setJobCodeId(req.employee.jobTypeDetail?.jobType?.id?.toString() || "");
        setTransferType(req.transferType || "");
        setToDepartment(req.transferTo?.depName || "");
        setToDepartmentId(req.transferTo?.deptId?.toString() || "");
        setTransferReason(req.description || "");
        setRequestDate(req.dateRequest || "");
        setRemark(req.remark || "");
        setStatus(req.status || "");
        setEmpId(req.employee.empId || "");
        setApproverDecision(req.status || "");
        if (req.employee.payGrade?.payGradeId) {
          fetch(
            `http://localhost:8080/api/hr-pay-grad/${req.employee.payGrade.payGradeId}`
          )
            .then((res) => (res.ok ? res.json() : null))
            .then((payGradeData) => {
              const stepNo =
                payGradeData && payGradeData.stepNo ? payGradeData.stepNo : "";
              setIncrementStep(stepNo);
              setSelectedIncrementStep(stepNo);
            })
            .catch(() => {
              setIncrementStep("");
              setSelectedIncrementStep("");
            });
        } else {
          setIncrementStep("");
          setSelectedIncrementStep("");
        }
      } else if (req) {
        setTransferType(req.transferType || "");
        setRemark(req.remark || "");
        setApproverDecision(req.status || "");
        setCurrentSalary(req.currentSalary || "");
      }
    }
  }, [selectedRequest, transferRequests, jobResponsibilities]);

  const handleSelectDepartment = (deptId: number) => {
    if (departmentFieldBeingEdited === "to") {
      const dept = departments.find((d) => d.deptId === deptId);
      setToDepartment(dept ? dept.deptName : "");
      setToDepartmentId(dept ? dept.deptId.toString() : "");
      setShowDepartmentTreeModal(false);
      setDepartmentFieldBeingEdited(null);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    fetch("http://localhost:8080/api/hr-lu-responsibility")
      .then((res) => res.json())
      .then((data) => {
        setJobResponsibilities(data);
      })
      .catch((err) =>
        console.error("Failed to fetch job responsibilities", err)
      );
  }, []);
  useEffect(() => {
    fetch("http://localhost:8080/api/hr-lu-branch")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch branches");
        return res.json();
      })
      .then((data) => {
        setBranches(data);
      });
  }, []);
  useEffect(() => {
    fetch("http://localhost:8080/api/jobtypes/job-titles")
      .then((res) => res.json())
      .then((data) => setJobTitles(data))
      .catch((err) => console.error("Failed to fetch job titles", err));
  }, []);
  useEffect(() => {
    fetch("http://localhost:8080/api/hr-pay-grad/steps")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch increment steps");
        }
        return res.text();
      })
      .then((text) => {
        try {
          const data = text ? JSON.parse(text) : [];
          setIncrementSteps(Array.isArray(data) ? data : []);
        } catch (err) {
          setIncrementSteps([]);
          console.error("Failed to parse increment steps JSON", err);
        }
      })
      .catch((err) => {
        setIncrementSteps([]);
        console.error("Failed to fetch increment steps", err);
      });
  }, []);
  useEffect(() => {
    const fetchIcfData = async () => {
      try {
        const data = await fetchICFs();
        setIcfList(
          Array.isArray(data) ? data.map((item: any) => item.ICF) : []
        );
      } catch (error) {
        console.error("Error fetching ICFs:", error);
      }
    };
    fetchIcfData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Approve Dept From</title>
        <meta name="description" content="Approve dept from form" />
      </Head>
      <Toaster />
      <div className="w-full p-0 ">
        <div className="bg-white shadow rounded-lg p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Search Requester Info:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Update Request
                </label>
                <div className="flex-1 relative" ref={dropdownRef}>
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    placeholder="--Select One--"
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {searchValue && (
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500 hover:text-red-500"
                      onClick={() => {
                        setSearchValue("");
                        setShowDropdown(false);
                      }}
                    >
                      ×
                    </button>
                  )}
                  {showDropdown && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                      {loading ? (
                        <li className="p-2 text-gray-400">Loading...</li>
                      ) : (
                        <>
                          {transferRequests
                            .filter((req) => {
                              const empId =
                                req.employee?.empId?.toString() || "";
                              const empName = [
                                req.employee?.firstName,
                                req.employee?.middleName,
                                req.employee?.lastName,
                              ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();
                              return (
                                searchValue.trim() === "" ||
                                empId.includes(searchValue.trim()) ||
                                empName.includes(
                                  searchValue.trim().toLowerCase()
                                )
                              );
                            })
                            .map((req) => {
                              const empId = req.employee?.empId || "N/A";
                              const fullName =
                                [
                                  req.employee?.firstName,
                                  req.employee?.middleName,
                                  req.employee?.lastName,
                                ]
                                  .filter(Boolean)
                                  .join(" ") || "";

                              return (
                                <li
                                  key={req.transferRequesterId}
                                  className={`p-2 hover:bg-gray-200 cursor-pointer ${
                                    selectedRequest ===
                                    req.transferRequesterId.toString()
                                      ? "bg-blue-100"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedRequest(
                                      req.transferRequesterId.toString()
                                    );
                                    setShowDropdown(false);
                                    setSearchValue(`${empId} - ${fullName}`);
                                  }}
                                >
                                  {empId} - {fullName}
                                </li>
                              );
                            })}
                          {transferRequests.filter((req) => {
                            const empId = req.employee?.empId?.toString() || "";
                            const empName = [
                              req.employee?.firstName,
                              req.employee?.middleName,
                              req.employee?.lastName,
                            ]
                              .filter(Boolean)
                              .join(" ")
                              .toLowerCase();
                            return (
                              searchValue.trim() === "" ||
                              empId.includes(searchValue.trim()) ||
                              empName.includes(searchValue.trim().toLowerCase())
                            );
                          }).length === 0 && (
                            <li className="p-2 text-gray-400">
                              No results found
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-lg p-6 w-full"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Transfer Request:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Employee Name
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Gender
                </label>
                <input
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Job Title
                </label>
                <input
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Hired Date
                </label>
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={hiredDate}
                  onChange={(e) => setHiredDate(e.target.value)}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Directorate
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={directorate}
                  onChange={(e) => setDirectorate(e.target.value)}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Job Responsibility
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md focus:outline-none p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={jobResponsibility}
                  onChange={(e) => setJobResponsibility(e.target.value)}
                  readOnly
                />
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Employee ID
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Department
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    readOnly
                  />
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  ICF
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={icf}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Increment Step
                </label>
                <input
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={incrementStep}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Division
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md focus:outline-none p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Branch
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md focus:outline-none p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  readOnly
                />
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Assigned Detail:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Transfer Type
                </label>
                <select
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={transferType}
                  onChange={(e) =>
                    setTransferType(e.target.value as TransferType)
                  }
                >
                  <option value="">--Select one--</option>
                  <option value="direct transfer">direct transfer</option>
                  <option value="transfer">transfer</option>
                </select>
              </div>
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  To Department
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    value={toDepartment}
                    readOnly
                    placeholder=""
                    onClick={() => {
                      setDepartmentFieldBeingEdited("to");
                      setShowDepartmentTreeModal(true);
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Job Title
                </label>
                <div className="flex-1">
                  <select
                    className="flex-1 w-full border border-gray-300 rounded-md focus:outline-none p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-300 truncate"
                    style={{
                      minWidth: "120px",
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                    }}
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value);
                      const selected = jobTitles.find(
                        (jt) => jt.jobTitle === e.target.value
                      );
                    }}
                  >
                    <option value="">--Select One--</option>
                    {jobPosition &&
                      !jobTitles.some((jt) => jt.jobTitle === jobPosition) && (
                        <option value={jobPosition}>{jobPosition}</option>
                      )}
                    {jobTitles.map((jt) => (
                      <option key={jt.id} value={jt.jobTitle}>
                        {jt.jobTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  ICF
                </label>
                <select
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={icfDropdown}
                  onChange={(e) => {
                    setIcfDropdown(e.target.value);
                    const fetchAndLogIcfId = async () => {
                      try {
                        const data = await fetchICFs();
                        const found = Array.isArray(data)
                          ? data.find((item) => item.ICF === e.target.value)
                          : null;
                        if (found) {
                          console.log("Selected ICF ID:", found.id);
                        } else {
                          console.log("Selected ICF not found");
                        }
                      } catch (err) {
                        console.log("Error fetching ICFs for ID lookup", err);
                      }
                    };
                    if (e.target.value) fetchAndLogIcfId();
                  }}
                >
                  <option value="">--Select One--</option>
                  {icfList.map((icfValue, idx) => (
                    <option key={idx} value={icfValue}>
                      {icfValue}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                <div className="flex flex-row items-center gap-2 justify-end">
                  <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                    Ref_No:
                  </label>
                  <textarea
                    className="flex-1 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300 resize-y min-h-[40px] max-h-[200px]"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Branch Name To:
                </label>
                <select
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={branchNameTo}
                  onChange={(e) => {
                    setBranchNameTo(e.target.value);
                    const selectedBranch = branches.find(
                      (branch) => branch.branchName === e.target.value
                    );
                    if (selectedBranch) {
                      console.log("Selected Branch ID:", selectedBranch.id);
                    } else {
                      console.log("Selected Branch not found");
                    }
                  }}
                >
                  <option value="">--Select One--</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.branchName}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row items-center gap-2 justify-start mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Processed by:
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={progressBy}
                  onChange={(e) => setProgressBy(e.target.value)}
                  readOnly
                />
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Date From:
                </label>
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  From Department
                </label>
                <div className="flex-1">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                    value={fromDepartment}
                    onChange={(e) => setFromDepartment(e.target.value)}
                    readOnly
                  />
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 justify-start mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Job Class
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={jobClass}
                  onChange={(e) => setJobClass(e.target.value)}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Increment Step
                </label>
                <select
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={selectedIncrementStep}
                  onChange={(e) => setSelectedIncrementStep(e.target.value)}
                >
                  <option value="">--Select One--</option>
                  {incrementSteps.map((step) => (
                    <option key={step} value={step}>
                      {step}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row items-center gap-2 justify-start">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Salary
                </label>
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(e.target.value)}
                  readOnly
                />
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Job Responsibility
                </label>
                <div className="flex-1">
                  <select
                    className="flex-1 w-full border border-gray-300 rounded-md focus:outline-none p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-300 truncate"
                    style={{
                      minWidth: "120px",
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                    }}
                    value={jobResponsibilityId}
                    onChange={(e) => {
                      setJobResponsibilityId(e.target.value);
                      const selected = jobResponsibilities.find(
                        (j) => j.id.toString() === e.target.value
                      );
                      setJobResponsibility(
                        selected ? selected.responsibility : ""
                      );
                    }}
                  >
                    <option value="">--Select One--</option>
                    {jobResponsibilities.map((resp) => (
                      <option
                        key={resp.id}
                        value={resp.id}
                        style={{
                          maxWidth: "80px",
                          overflowX: "auto",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          display: "block",
                        }}
                      >
                        {resp.responsibility}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-0 whitespace-nowrap min-w-[120px]">
                  Change To:
                </label>
                <select
                  className="flex-1 border border-gray-300 rounded-md focus:outline-none p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
                  value={changeTo}
                  onChange={(e) => setChangeTo(e.target.value)}
                >
                  <option value="">--Select One--</option>
                  <option value="permanent">Permanent</option>
                  <option value="project">Project</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-start">
            {selectedRequest ? (
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Update
              </button>
            ) : (
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Create
              </button>
            )}
          </div>
        </form>
      </div>
      {/* To Department modal*/}
      {showDepartmentTreeModal && departmentFieldBeingEdited === "to" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                {departments.find((d) => d.deptId === 61)?.deptName ||
                  "No Department Trees"}
              </h2>
              <button
                className="text-gray-700 hover:text-gray-800 text-2xl"
                onClick={() => {
                  setShowDepartmentTreeModal(false);
                  setDepartmentFieldBeingEdited(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <DepartmentTree
                dept={{
                  deptId: 61,
                  deptName:
                    departments.find((d) => d.deptId === 61)?.deptName ||
                    "No Departments",
                  deptLevel: 0,
                  parentDeptId: null,
                }}
                onSelect={handleSelectDepartment}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HrPromotionPage() {
  return (
    <AppModuleLayout>
      <HrPromotion />
    </AppModuleLayout>
  );
}
