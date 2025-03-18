import React, { useRef, useEffect } from "react";
import styled from "styled-components";

const TableWrapper = styled.div`
  width: 440px;
  overflow-x: auto;
  position: relative;
::-webkit-scrollbar {
  display: none;
}

scrollbar-width: none;

-ms-overflow-style: none;

`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: transparent;
  color: white;
  border-top: 1px solid #fff;
`;

const TableHeader = styled.th`
  border-left: 1px solid #fff;
  border-bottom: 1px solid #fff;
  padding: 10px;
  background: transparent;
  color: white;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 2;
`;

const TableCell = styled.td`
  border-left: 1px solid #fff;
  border-top: 1px solid #fff;
  padding: 12px;
  min-width: 120px;
`;

const InputField = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: white;
  text-align: center;
  appearance: none;
`;

const ScrollableContainer = styled.div`
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  max-width: 568px;
  cursor: grab;
`;
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


interface TableMonthProps {
    tableData: string[][];
    onDataChange: (tableData: string[][]) => void;
}

const TableMonth: React.FC<TableMonthProps> = ({ tableData, onDataChange }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const velocity = useRef(0);
    const animationFrame = useRef<number | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
        velocity.current = 0;
        scrollRef.current.style.cursor = "grabbing";
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!scrollRef.current || !isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 1;
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
        velocity.current = -walk * 0.05;
    };
    const handleMouseUp = () => {
        if (!scrollRef.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = "grab";
        startInertia();
    };

    const startInertia = () => {
        if (!scrollRef.current) return;

        const applyInertia = () => {
            if (!scrollRef.current) return;
            scrollRef.current.scrollLeft += velocity.current;
            velocity.current *= 0.95;

            if (Math.abs(velocity.current) > 0.3) {
                animationFrame.current = requestAnimationFrame(applyInertia);
            } else {
                cancelAnimationFrame(animationFrame.current!);
            }
        };

        applyInertia();
    };

    const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
        const newData = [...tableData];
        newData[rowIndex][colIndex] = value;
        onDataChange(newData);
    };

    useEffect(() => {
        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, []);

    return (
        <TableWrapper>
            <StyledTable>
                <thead>
                    <tr>
                        <TableHeader colSpan={12} >Month</TableHeader>
                    </tr>
                </thead>
            </StyledTable>

            <ScrollableContainer
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
                onMouseUp={handleMouseUp}
            >
                <StyledTable>
                    <thead>
                        <tr>
                            {months.map((month, index) => (
                                <TableHeader key={index} style={{ minWidth: "120px" }}>{month}</TableHeader>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {tableData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <TableCell key={colIndex}>
                                        <InputField
                                            type="text"
                                            value={cell}
                                            onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                                        />
                                    </TableCell>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            </ScrollableContainer>
        </TableWrapper>
    );
};

export default TableMonth;